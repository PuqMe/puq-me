import type { FastifyPluginAsync } from "fastify";

const matchRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request) => {
    const result = await app.db.query(
      `select m.id,
              m.matched_at,
              u.public_id as peer_user_id,
              p.display_name,
              t.last_message_at
       from matches m
       join match_participants mp_self on mp_self.match_id = m.id and mp_self.user_id = $1
       join match_participants mp_peer on mp_peer.match_id = m.id and mp_peer.user_id <> $1
       join users u on u.id = mp_peer.user_id
       join profiles p on p.user_id = mp_peer.user_id
       left join chat_threads t on t.match_id = m.id
       where m.status = 'active'
       order by m.matched_at desc
       limit 100`,
      [request.user.sub]
    );

    return { items: result.rows };
  });
};

export default matchRoutes;
