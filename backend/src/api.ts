import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { getDb } from "./db";
import { runSalesScan } from "./ai-scan";

export function createApiServer(port: number = 18800): void {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  // Middleware: extract user_id from x-user-id header (set by Next.js after auth)
  function getUserId(req: express.Request, res: express.Response): string | null {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(401).json({ error: "Missing x-user-id header" });
      return null;
    }
    return userId;
  }

  // Ensure user exists
  function ensureUser(userId: string, email?: string, name?: string, image?: string) {
    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    if (!existing) {
      db.prepare("INSERT INTO users (id, email, name, image) VALUES (?, ?, ?, ?)").run(
        userId,
        email || "unknown",
        name || null,
        image || null
      );
    }
  }

  // --- Clients ---
  app.get("/api/clients", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const rows = getDb().prepare("SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(rows);
  });

  app.post("/api/clients", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const { name, domain, email, userName, image } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    ensureUser(userId, email, userName, image);
    try {
      const result = getDb().prepare("INSERT INTO clients (user_id, name, domain) VALUES (?, ?, ?)").run(userId, name, domain || null);
      res.json({ id: result.lastInsertRowid, name, domain });
    } catch (e: any) {
      if (e.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Client already exists" });
      throw e;
    }
  });

  app.delete("/api/clients/:id", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    getDb().prepare("DELETE FROM clients WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ ok: true });
  });

  // --- Keywords ---
  app.get("/api/keywords", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const rows = getDb().prepare("SELECT * FROM trend_keywords WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(rows);
  });

  app.post("/api/keywords", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const { keyword, email, userName, image } = req.body;
    if (!keyword) return res.status(400).json({ error: "keyword required" });
    ensureUser(userId, email, userName, image);
    try {
      const result = getDb().prepare("INSERT INTO trend_keywords (user_id, keyword) VALUES (?, ?)").run(userId, keyword);
      res.json({ id: result.lastInsertRowid, keyword });
    } catch (e: any) {
      if (e.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Keyword already exists" });
      throw e;
    }
  });

  app.delete("/api/keywords/:id", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    getDb().prepare("DELETE FROM trend_keywords WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ ok: true });
  });

  // --- Digests ---
  app.get("/api/digests", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const date = req.query.date as string;
    if (date) {
      const rows = getDb().prepare("SELECT * FROM digests WHERE user_id = ? AND date = ? ORDER BY score DESC").all(userId, date);
      res.json(rows);
    } else {
      const rows = getDb().prepare("SELECT * FROM digests WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(userId);
      res.json(rows);
    }
  });

  app.get("/api/digests/latest", (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const latestDate = getDb().prepare("SELECT date FROM digests WHERE user_id = ? ORDER BY date DESC LIMIT 1").get(userId) as any;
    if (!latestDate) return res.json([]);
    const rows = getDb().prepare("SELECT * FROM digests WHERE user_id = ? AND date = ? ORDER BY score DESC").all(userId, latestDate.date);
    res.json(rows);
  });

  // --- Scan ---
  let scanRunning = false;

  app.post("/api/scan", async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    if (scanRunning) return res.status(409).json({ error: "Scan already running" });
    scanRunning = true;
    try {
      const result = await runSalesScan(userId);
      res.json(result);
    } catch (err: any) {
      console.error("Scan error:", err);
      res.status(500).json({ error: "Scan failed", message: err.message });
    } finally {
      scanRunning = false;
    }
  });

  app.get("/api/scan/status", (_req, res) => {
    res.json({ running: scanRunning });
  });

  app.listen(port, () => {
    console.log(`OpportunityClaw API running on port ${port}`);
  });

}
