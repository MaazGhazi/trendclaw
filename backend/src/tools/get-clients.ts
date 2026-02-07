import { getDb } from "../db";

export function getClients(params: { user_id: string }) {
  const rows = getDb()
    .prepare("SELECT id, name, domain FROM clients WHERE user_id = ?")
    .all(params.user_id);
  return rows;
}
