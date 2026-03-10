import type { FastifyInstance } from "fastify";
import type { PoolClient } from "pg";
import { ForbiddenError, NotFoundError } from "../../common/errors.js";
import type { MatchItem } from "./schema.js";

type MatchListRow = {
  match_id: string;
  status: "active" | "unmatched" | "blocked";
  matched_at: string;
  peer_user_id: string;
  peer_display_name: string;
  peer_birth_date: string;
  peer_bio: string | null;
  peer_city: string | null;
  peer_country_code: string | null;
  peer_primary_photo_url: string | null;
  conversation_id: string | null;
  last_message_at: string | null;
};

type MatchCreationRow = {
  match_id: string;
  created: boolean;
};

export class MatchRepository {
  constructor(private readonly app: FastifyInstance) {}

  private calculateAge(birthDate: string) {
    const now = new Date();
    const date = new Date(birthDate);
    let age = now.getUTCFullYear() - date.getUTCFullYear();
    const monthOffset = now.getUTCMonth() - date.getUTCMonth();
    if (monthOffset < 0 || (monthOffset === 0 && now.getUTCDate() < date.getUTCDate())) {
      age -= 1;
    }
    return age;
  }

  private mapMatchRow(row: MatchListRow): MatchItem {
    return {
      matchId: row.match_id,
      status: row.status,
      matchedAt: row.matched_at,
      peer: {
        userId: row.peer_user_id,
        displayName: row.peer_display_name,
        age: this.calculateAge(row.peer_birth_date),
        bio: row.peer_bio,
        city: row.peer_city,
        countryCode: row.peer_country_code,
        primaryPhotoUrl: row.peer_primary_photo_url
      },
      conversation: {
        conversationId: row.conversation_id,
        lastMessageAt: row.last_message_at
      }
    };
  }

  private async loadMatchRow(userId: string, matchId: string, client?: PoolClient): Promise<MatchListRow | null> {
    const executor = client ?? this.app.db;
    const result = await executor.query<MatchListRow>(
      `select
         m.id::text as match_id,
         m.status,
         m.matched_at::text,
         peer.id::text as peer_user_id,
         p.display_name as peer_display_name,
         p.birth_date::text as peer_birth_date,
         p.bio as peer_bio,
         p.city as peer_city,
         p.country_code as peer_country_code,
         pp.cdn_url as peer_primary_photo_url,
         c.id::text as conversation_id,
         c.last_message_at::text as last_message_at
       from matches m
       join users peer
         on peer.id = case
           when m.user_low_id = $1::bigint then m.user_high_id
           else m.user_low_id
         end
       join profiles p on p.user_id = peer.id
       left join profile_photos pp
         on pp.user_id = peer.id
        and pp.is_primary = true
        and pp.deleted_at is null
       left join conversations c on c.match_id = m.id
       where m.id = $2::bigint
         and $1::bigint in (m.user_low_id, m.user_high_id)
       limit 1`,
      [userId, matchId]
    );

    return result.rows[0] ?? null;
  }

  async hasMutualPositiveSwipe(actorUserId: string, targetUserId: string, client?: PoolClient) {
    const executor = client ?? this.app.db;
    const result = await executor.query<{ exists: boolean }>(
      `select exists(
         select 1
         from swipes
         where actor_user_id = $1
           and target_user_id = $2
           and direction in ('right', 'super')
       ) as exists`,
      [targetUserId, actorUserId]
    );

    return Boolean(result.rows[0]?.exists);
  }

  async ensureMatchFromPositiveSwipe(actorUserId: string, targetUserId: string) {
    const client = await this.app.db.connect();

    try {
      await client.query("begin");

      const isMutualLike = await this.hasMutualPositiveSwipe(actorUserId, targetUserId, client);
      if (!isMutualLike) {
        await client.query("commit");
        return {
          created: false,
          isMutualLike: false,
          match: null
        };
      }

      const inserted = await client.query<MatchCreationRow>(
        `insert into matches (
           user_low_id,
           user_high_id,
           status,
           matched_at,
           unmatched_at,
           created_at,
           updated_at
         )
         values (
           least($1::bigint, $2::bigint),
           greatest($1::bigint, $2::bigint),
           'active',
           now(),
           null,
           now(),
           now()
         )
         on conflict (user_low_id, user_high_id)
         do update set
           status = 'active',
           unmatched_at = null,
           updated_at = now()
         returning
           id::text as match_id,
           (xmax = 0) as created`,
        [actorUserId, targetUserId]
      );

      const matchRow = inserted.rows[0];

      await client.query(
        `insert into conversations (
           match_id,
           started_by_user_id,
           status,
           created_at,
           updated_at
         )
         values ($1::bigint, $2::bigint, 'active', now(), now())
         on conflict (match_id)
         do update set
           status = 'active',
           updated_at = now()`,
        [matchRow.match_id, actorUserId]
      );

      const hydrated = await this.loadMatchRow(actorUserId, matchRow.match_id, client);
      await client.query("commit");

      return {
        created: matchRow.created,
        isMutualLike: true,
        match: hydrated ? this.mapMatchRow(hydrated) : null
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async getForUser(userId: string, matchId: string) {
    const row = await this.loadMatchRow(userId, matchId);
    if (!row) {
      throw new NotFoundError("match_not_found");
    }

    return this.mapMatchRow(row);
  }

  async listForUser(userId: string) {
    const result = await this.app.db.query<MatchListRow>(
      `select
         m.id::text as match_id,
         m.status,
         m.matched_at::text,
         peer.id::text as peer_user_id,
         p.display_name as peer_display_name,
         p.birth_date::text as peer_birth_date,
         p.bio as peer_bio,
         p.city as peer_city,
         p.country_code as peer_country_code,
         pp.cdn_url as peer_primary_photo_url,
         c.id::text as conversation_id,
         c.last_message_at::text as last_message_at
       from matches m
       join users peer
         on peer.id = case
           when m.user_low_id = $1::bigint then m.user_high_id
           else m.user_low_id
         end
       join profiles p on p.user_id = peer.id
       left join profile_photos pp
         on pp.user_id = peer.id
        and pp.is_primary = true
        and pp.deleted_at is null
       left join conversations c on c.match_id = m.id
       where $1::bigint in (m.user_low_id, m.user_high_id)
         and m.status = 'active'
       order by m.matched_at desc`,
      [userId]
    );

    return result.rows.map((row) => this.mapMatchRow(row));
  }

  async assertMembership(userId: string, matchId: string) {
    const result = await this.app.db.query<{ allowed: boolean }>(
      `select exists(
         select 1
         from matches
         where id = $2::bigint
           and $1::bigint in (user_low_id, user_high_id)
       ) as allowed`,
      [userId, matchId]
    );

    if (!result.rows[0]?.allowed) {
      throw new ForbiddenError("match_access_denied");
    }
  }
}
