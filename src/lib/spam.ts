import type { FastifyInstance } from "fastify";

export async function guardActionRate(app: FastifyInstance, key: string, limit: number, windowSeconds: number): Promise<void> {
  const tx = app.redis.multi();
  tx.incr(key);
  tx.expire(key, windowSeconds, "NX");
  const [countReply] = await tx.exec() ?? [];
  const count = Number(countReply?.[1] ?? 0);

  if (count > limit) {
    throw app.httpErrors.tooManyRequests("rate_limited");
  }
}

export function containsSuspiciousText(input: string): boolean {
  const patterns = [
    /(telegram|whatsapp|snapchat|onlyfans)/i,
    /(crypto|investment|btc|eth)/i,
    /(http:\/\/|https:\/\/|www\.)/i
  ];

  return patterns.some((pattern) => pattern.test(input));
}
