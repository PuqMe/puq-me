import type { FastifyInstance } from "fastify";
import { BadRequestError, NotFoundError } from "../../common/errors.js";
import type { CreateSwipeBody } from "./schema.js";

type ViewerPreferenceRow = {
  min_age: number;
  max_age: number;
  max_distance_km: number;
  interested_in: string[];
  only_verified_profiles: boolean;
};

export type ViewerPreferenceRecord = {
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  interestedIn: string[];
  onlyVerifiedProfiles: boolean;
};

export type CandidateRecord = {
  userId: string;
  displayName: string;
  birthDate: string;
  bio: string | null;
  city: string | null;
  countryCode: string | null;
  primaryPhotoUrl: string | null;
  distanceKm: number;
  profileQualityScore: number;
  activityScore: number;
  responseProbabilityScore: number;
  createdAt: string;
};

export class SwipeRepository {
  constructor(private readonly app: FastifyInstance) {}

  async getViewerPreferences(userId: string): Promise<ViewerPreferenceRecord> {
    const result = await this.app.db.query<ViewerPreferenceRow>(
      `select min_age,
              max_age,
              max_distance_km,
              coalesce(array(select jsonb_array_elements_text(interested_in)), array[]::text[]) as interested_in,
              only_verified_profiles
       from user_preferences
       where user_id = $1
       limit 1`,
      [userId]
    );

    const row = result.rows[0] ?? {
      min_age: 18,
      max_age: 99,
      max_distance_km: 50,
      interested_in: ["everyone"],
      only_verified_profiles: false
    };

    return {
      minAge: row.min_age,
      maxAge: row.max_age,
      maxDistanceKm: row.max_distance_km,
      interestedIn: row.interested_in,
      onlyVerifiedProfiles: row.only_verified_profiles
    };
  }

  async retrieveCandidates(userId: string, limit: number): Promise<CandidateRecord[]> {
    const preferences = await this.getViewerPreferences(userId);

    const result = await this.app.db.query<{
      user_id: string;
      display_name: string;
      birth_date: string;
      bio: string | null;
      city: string | null;
      country_code: string | null;
      primary_photo_url: string | null;
      distance_km: number;
      profile_quality_score: number;
      activity_score: number;
      response_probability_score: number;
      created_at: string;
    }>(
      `with viewer_location as (
         select latitude, longitude
         from user_locations
         where user_id = $1
         limit 1
       )
       select
         u.id::text as user_id,
         p.display_name,
         p.birth_date::text,
         p.bio,
         p.city,
         p.country_code,
         pp.cdn_url as primary_photo_url,
         round(
           (
             6371 * acos(
               least(
                 1,
                 cos(radians((select latitude from viewer_location))) *
                 cos(radians(ul.latitude)) *
                 cos(radians(ul.longitude) - radians((select longitude from viewer_location))) +
                 sin(radians((select latitude from viewer_location))) *
                 sin(radians(ul.latitude))
               )
             )
           )::numeric,
           2
         ) as distance_km,
         coalesce(p.profile_quality_score, 0)::float as profile_quality_score,
         case
           when u.last_active_at > now() - interval '1 hour' then 100
           when u.last_active_at > now() - interval '24 hours' then 75
           when u.last_active_at > now() - interval '3 days' then 45
           else 15
         end::float as activity_score,
         greatest(
           5,
           least(
             100,
             100 - coalesce(ucrs.risk_score, 0)
             + case
                 when u.last_active_at > now() - interval '24 hours' then 10
                 else 0
               end
           )
         )::float as response_probability_score,
         u.created_at::text as created_at
       from users u
       join profiles p on p.user_id = u.id
       join user_locations ul on ul.user_id = u.id
       left join user_communication_risk_scores ucrs on ucrs.user_id = u.id
       left join profile_photos pp
         on pp.user_id = u.id
        and pp.is_primary = true
        and pp.deleted_at is null
       where u.id <> $1
         and u.deleted_at is null
         and u.status = 'active'
         and p.is_visible = true
         and p.moderation_status = 'approved'
         and date_part('year', age(p.birth_date)) between $2 and $3
         and (
           cardinality($4::text[]) = 0
           or 'everyone' = any($4::text[])
           or p.gender = any($4::text[])
         )
         and ($7::boolean = false or exists (
           select 1
           from verification_requests vr
           where vr.user_id = u.id
             and vr.status = 'approved'
         ))
         and not exists (
           select 1
           from swipes s
           where s.actor_user_id = $1
             and s.target_user_id = u.id
         )
         and not exists (
           select 1
           from matches m
           where m.user_low_id = least($1::bigint, u.id)
             and m.user_high_id = greatest($1::bigint, u.id)
             and m.status = 'active'
         )
         and not exists (
           select 1
           from blocks b
           where (b.blocker_user_id = $1 and b.blocked_user_id = u.id)
              or (b.blocker_user_id = u.id and b.blocked_user_id = $1)
         )
         and (
           6371 * acos(
             least(
               1,
               cos(radians((select latitude from viewer_location))) *
               cos(radians(ul.latitude)) *
               cos(radians(ul.longitude) - radians((select longitude from viewer_location))) +
               sin(radians((select latitude from viewer_location))) *
               sin(radians(ul.latitude))
             )
           )
         ) <= $5
       order by p.profile_quality_score desc nulls last, u.last_active_at desc nulls last
       limit $6`,
      [
        userId,
        preferences.minAge,
        preferences.maxAge,
        preferences.interestedIn,
        preferences.maxDistanceKm,
        Math.max(limit * 4, 80),
        preferences.onlyVerifiedProfiles
      ]
    );

    return result.rows.map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      birthDate: row.birth_date,
      bio: row.bio,
      city: row.city,
      countryCode: row.country_code,
      primaryPhotoUrl: row.primary_photo_url,
      distanceKm: Number(row.distance_km),
      profileQualityScore: Number(row.profile_quality_score),
      activityScore: Number(row.activity_score),
      responseProbabilityScore: Number(row.response_probability_score),
      createdAt: row.created_at
    }));
  }

  async hydrateCandidatesByIds(userId: string, candidateIds: string[]): Promise<CandidateRecord[]> {
    if (candidateIds.length === 0) {
      return [];
    }

    const result = await this.app.db.query<{
      user_id: string;
      display_name: string;
      birth_date: string;
      bio: string | null;
      city: string | null;
      country_code: string | null;
      primary_photo_url: string | null;
      distance_km: number;
      profile_quality_score: number;
      activity_score: number;
      response_probability_score: number;
      created_at: string;
    }>(
      `with viewer_location as (
         select latitude, longitude
         from user_locations
         where user_id = $1
         limit 1
       )
       select
         u.id::text as user_id,
         p.display_name,
         p.birth_date::text,
         p.bio,
         p.city,
         p.country_code,
         pp.cdn_url as primary_photo_url,
         round(
           (
             6371 * acos(
               least(
                 1,
                 cos(radians((select latitude from viewer_location))) *
                 cos(radians(ul.latitude)) *
                 cos(radians(ul.longitude) - radians((select longitude from viewer_location))) +
                 sin(radians((select latitude from viewer_location))) *
                 sin(radians(ul.latitude))
               )
             )
           )::numeric,
           2
         ) as distance_km,
         coalesce(p.profile_quality_score, 0)::float as profile_quality_score,
         case
           when u.last_active_at > now() - interval '1 hour' then 100
           when u.last_active_at > now() - interval '24 hours' then 75
           when u.last_active_at > now() - interval '3 days' then 45
           else 15
         end::float as activity_score,
         greatest(
           5,
           least(
             100,
             100 - coalesce(ucrs.risk_score, 0)
             + case
                 when u.last_active_at > now() - interval '24 hours' then 10
                 else 0
               end
           )
         )::float as response_probability_score,
         u.created_at::text as created_at
       from users u
       join profiles p on p.user_id = u.id
       join user_locations ul on ul.user_id = u.id
       left join user_communication_risk_scores ucrs on ucrs.user_id = u.id
       left join profile_photos pp
         on pp.user_id = u.id
        and pp.is_primary = true
        and pp.deleted_at is null
       where u.id::text = any($2::text[])`,
      [userId, candidateIds]
    );

    const byId = new Map(
      result.rows.map((row) => [
        row.user_id,
        {
          userId: row.user_id,
          displayName: row.display_name,
          birthDate: row.birth_date,
          bio: row.bio,
          city: row.city,
          countryCode: row.country_code,
          primaryPhotoUrl: row.primary_photo_url,
          distanceKm: Number(row.distance_km),
          profileQualityScore: Number(row.profile_quality_score),
          activityScore: Number(row.activity_score),
          responseProbabilityScore: Number(row.response_probability_score),
          createdAt: row.created_at
        } satisfies CandidateRecord
      ])
    );

    return candidateIds
      .map((id) => byId.get(id))
      .filter((candidate): candidate is CandidateRecord => Boolean(candidate));
  }

  async saveSwipe(input: { actorUserId: string; targetUserId: string; direction: CreateSwipeBody["direction"] }) {
    if (input.actorUserId === input.targetUserId) {
      throw new BadRequestError("cannot_swipe_own_profile");
    }

    const targetExists = await this.app.db.query<{ exists: boolean }>(
      `select true as exists
       from users
       where id = $1
         and deleted_at is null
       limit 1`,
      [input.targetUserId]
    );

    if (!targetExists.rows[0]?.exists) {
      throw new NotFoundError("target_profile_not_found");
    }

    const result = await this.app.db.query<{ id: string }>(
      `insert into swipes (actor_user_id, target_user_id, direction, source)
       values ($1, $2, $3, 'discover')
       on conflict (actor_user_id, target_user_id)
       do update set direction = excluded.direction,
                     updated_at = now()
       returning id::text`,
      [input.actorUserId, input.targetUserId, input.direction]
    );

    return result.rows[0];
  }

}
