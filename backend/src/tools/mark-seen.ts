import crypto from "crypto";
import { getDb } from "../db";

export function markSeen(params: { user_id: string; url: string; entity: string; title: string }) {
  const urlHash = crypto.createHash("sha256").update(params.url).digest("hex");
  try {
    getDb()
      .prepare("INSERT INTO seen_signals (user_id, url_hash, entity, title) VALUES (?, ?, ?, ?)")
      .run(params.user_id, urlHash, params.entity, params.title);
  } catch (e: any) {
    if (e.code !== "SQLITE_CONSTRAINT_UNIQUE") throw e;
  }
  return { ok: true };
}
