import { getDb } from "../db";

export function getKeywords(params: { user_id: string }) {
  const rows = getDb()
    .prepare("SELECT id, keyword FROM trend_keywords WHERE user_id = ?")
    .all(params.user_id);
  return rows;
}
