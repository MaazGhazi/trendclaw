import { getDb } from "./db";

const DEMO_USER_ID = "demo-user";

export function seedDemoData() {
  const db = getDb();

  // Ensure demo user exists
  const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(DEMO_USER_ID);
  if (!existing) {
    db.prepare("INSERT INTO users (id, email, name) VALUES (?, ?, ?)").run(
      DEMO_USER_ID,
      "demo@trendclaw.com",
      "Demo User"
    );
  }

  // Seed clients
  const clients = [
    { name: "TechVentures Inc", domain: "techventures.io" },
    { name: "CloudScale Solutions", domain: "cloudscale.dev" },
    { name: "DataDrive Analytics", domain: "datadrive.ai" },
    { name: "AI Innovations Lab", domain: "aiinnovations.com" },
    { name: "EnterpriseFlow", domain: "enterpriseflow.io" },
  ];

  for (const client of clients) {
    try {
      db.prepare("INSERT INTO clients (user_id, name, domain) VALUES (?, ?, ?)").run(
        DEMO_USER_ID,
        client.name,
        client.domain
      );
    } catch (e: any) {
      if (e.code !== "SQLITE_CONSTRAINT_UNIQUE") throw e;
    }
  }

  // Seed keywords
  const keywords = [
    "Series B",
    "hiring",
    "AI",
    "automation",
    "enterprise",
    "funding",
    "product launch",
    "expansion",
    "partnership",
    "acquisition",
  ];

  for (const keyword of keywords) {
    try {
      db.prepare("INSERT INTO trend_keywords (user_id, keyword) VALUES (?, ?)").run(
        DEMO_USER_ID,
        keyword
      );
    } catch (e: any) {
      if (e.code !== "SQLITE_CONSTRAINT_UNIQUE") throw e;
    }
  }

  console.log("Demo data seeded successfully!");
  console.log(`  - User: ${DEMO_USER_ID}`);
  console.log(`  - Clients: ${clients.length}`);
  console.log(`  - Keywords: ${keywords.length}`);
}

// Run if called directly
if (require.main === module) {
  seedDemoData();
}
