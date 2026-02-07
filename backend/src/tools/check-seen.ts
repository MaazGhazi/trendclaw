import crypto from "crypto";
import { getDb } from "../db";

export function checkSeen(params: { user_id: string; url: string }) {
  const urlHash = crypto.createHash("sha256").update(params.url).digest("hex");
  const row = getDb()
    .prepare("SELECT id FROM seen_signals WHERE user_id = ? AND url_hash = ?")
    .get(params.user_id, urlHash);
  return { seen: !!row };
}
