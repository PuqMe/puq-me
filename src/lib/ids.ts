import { randomUUID } from "node:crypto";

export function newPublicId(): string {
  return randomUUID();
}
