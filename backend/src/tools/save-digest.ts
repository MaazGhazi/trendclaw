import { getDb } from "../db";

export function saveDigest(params: {
  user_id: string;
  date: string;
  entity: string;
  type: string;
  summary: string;
  score: number;
  url: string;
  outreach_snippet: string;
  content_hook: string;
}) {
  const result = getDb()
    .prepare(
      `INSERT INTO digests (user_id, date, entity, signal_type, summary, score, url, outreach_snippet, content_hook)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      params.user_id,
      params.date,
      params.entity,
      params.type,
      params.summary,
      params.score,
      params.url,
      params.outreach_snippet,
      params.content_hook
    );
  return { id: result.lastInsertRowid };
}
