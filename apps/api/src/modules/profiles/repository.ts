import type { FastifyInstance } from "fastify";
import { NotFoundError } from "../../common/errors.js";
import type {
  UpdateInterestsBody,
  UpdateLocationBody,
  UpdatePreferencesBody,
  UpdateProfileBody,
  UpdateVisibilityBody
} from "./schema.js";

type ProfileAggregate = {
  userId: string;
  profile: {
    displayName: string;
    birthDate: string;
    bio: string | null;
    gender: string | null;
    datingIntent: string | null;
    occupation: string | null;
    city: string | null;
    countryCode: string | null;
    isVisible: boolean;
  };
  interests: string[];
  preferences: {
    interestedIn: string[];
    minAge: number;
    maxAge: number;
    maxDistanceKm: number;
    showMeGlobally: boolean;
    onlyVerifiedProfiles: boolean;
  };
  location: {
    latitude: number;
    longitude: number;
    city: string | null;
    countryCode: string | null;
  } | null;
};

export class ProfilesRepository {
  constructor(private readonly app: FastifyInstance) {}

  async getCurrentProfile(userId: string): Promise<ProfileAggregate> {
    const profileResult = await this.app.db.query<{
      user_id: string;
      display_name: string;
      birth_date: string;
      bio: string | null;
      gender: string | null;
      dating_intent: string | null;
      occupation: string | null;
      city: string | null;
      country_code: string | null;
      is_visible: boolean;
    }>(
      `select user_id::text,
              display_name,
              birth_date::text,
              bio,
              gender,
              dating_intent,
              occupation,
              city,
              country_code,
              is_visible
       from profiles
       where user_id = $1
       limit 1`,
      [userId]
    );

    const profile = profileResult.rows[0];
    if (!profile) {
      throw new NotFoundError("profile_not_found");
    }

    const [interestsResult, preferencesResult, locationResult] = await Promise.all([
      this.app.db.query<{ interest_code: string }>(
        `select interest_code
         from user_interests
         where user_id = $1
         order by interest_code asc`,
        [userId]
      ),
      this.app.db.query<{
        interested_in: string[];
        min_age: number;
        max_age: number;
        max_distance_km: number;
        show_me_globally: boolean;
        only_verified_profiles: boolean;
      }>(
        `select interested_in,
                min_age,
                max_age,
                max_distance_km,
                show_me_globally,
                only_verified_profiles
         from user_preferences
         where user_id = $1
         limit 1`,
        [userId]
      ),
      this.app.db.query<{
        latitude: number;
        longitude: number;
        city: string | null;
        country_code: string | null;
      }>(
        `select latitude, longitude, city, country_code
         from user_locations
         where user_id = $1
         limit 1`,
        [userId]
      )
    ]);

    const preferences = preferencesResult.rows[0] ?? {
      interested_in: [],
      min_age: 18,
      max_age: 99,
      max_distance_km: 50,
      show_me_globally: false,
      only_verified_profiles: false
    };

    return {
      userId,
      profile: {
        displayName: profile.display_name,
        birthDate: profile.birth_date,
        bio: profile.bio,
        gender: profile.gender,
        datingIntent: profile.dating_intent,
        occupation: profile.occupation,
        city: profile.city,
        countryCode: profile.country_code,
        isVisible: profile.is_visible
      },
      interests: interestsResult.rows.map((row) => row.interest_code),
      preferences: {
        interestedIn: preferences.interested_in ?? [],
        minAge: preferences.min_age,
        maxAge: preferences.max_age,
        maxDistanceKm: preferences.max_distance_km,
        showMeGlobally: preferences.show_me_globally,
        onlyVerifiedProfiles: preferences.only_verified_profiles
      },
      location: locationResult.rows[0]
        ? {
            latitude: locationResult.rows[0].latitude,
            longitude: locationResult.rows[0].longitude,
            city: locationResult.rows[0].city,
            countryCode: locationResult.rows[0].country_code
          }
        : null
    };
  }

  async updateProfile(userId: string, input: UpdateProfileBody) {
    const fields: string[] = [];
    const values: unknown[] = [userId];
    let index = 2;

    const mapping: Record<keyof UpdateProfileBody, string> = {
      displayName: "display_name",
      birthDate: "birth_date",
      bio: "bio",
      gender: "gender",
      datingIntent: "dating_intent",
      occupation: "occupation",
      city: "city",
      countryCode: "country_code"
    };

    for (const [key, value] of Object.entries(input) as Array<[keyof UpdateProfileBody, unknown]>) {
      fields.push(`${mapping[key]} = $${index}`);
      values.push(value);
      index += 1;
    }

    await this.app.db.query(
      `update profiles
       set ${fields.join(", ")},
           updated_at = now()
       where user_id = $1`,
      values
    );
  }

  async updateVisibility(userId: string, input: UpdateVisibilityBody) {
    await this.app.db.query(
      `update profiles
       set is_visible = $2,
           updated_at = now()
       where user_id = $1`,
      [userId, input.isVisible]
    );
  }

  async replaceInterests(userId: string, input: UpdateInterestsBody) {
    const client = await this.app.db.connect();
    try {
      await client.query("begin");
      await client.query(`delete from user_interests where user_id = $1`, [userId]);
      for (const interest of input.interests) {
        await client.query(
          `insert into user_interests (user_id, interest_code)
           values ($1, $2)`,
          [userId, interest]
        );
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async upsertPreferences(userId: string, input: UpdatePreferencesBody) {
    await this.app.db.query(
      `insert into user_preferences (
         user_id,
         interested_in,
         min_age,
         max_age,
         max_distance_km,
         show_me_globally,
         only_verified_profiles
       )
       values ($1, $2::jsonb, $3, $4, $5, $6, $7)
       on conflict (user_id)
       do update set interested_in = excluded.interested_in,
                     min_age = excluded.min_age,
                     max_age = excluded.max_age,
                     max_distance_km = excluded.max_distance_km,
                     show_me_globally = excluded.show_me_globally,
                     only_verified_profiles = excluded.only_verified_profiles,
                     updated_at = now()`,
      [
        userId,
        JSON.stringify(input.interestedIn),
        input.minAge,
        input.maxAge,
        input.maxDistanceKm,
        input.showMeGlobally ?? false,
        input.onlyVerifiedProfiles ?? false
      ]
    );
  }

  async upsertLocation(userId: string, input: UpdateLocationBody) {
    await this.app.db.query(
      `insert into user_locations (user_id, latitude, longitude, city, country_code, updated_at)
       values ($1, $2, $3, $4, $5, now())
       on conflict (user_id)
       do update set latitude = excluded.latitude,
                     longitude = excluded.longitude,
                     city = excluded.city,
                     country_code = excluded.country_code,
                     updated_at = now()`,
      [userId, input.latitude, input.longitude, input.city ?? null, input.countryCode ?? null]
    );
  }
}
