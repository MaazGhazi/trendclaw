import "dotenv/config";
import { createApiServer } from "./api";
import { getDb } from "./db";

// Initialize database
getDb();

// Start API server
const port = parseInt(process.env.OPPORTUNITYCLAW_PORT || "18800", 10);
createApiServer(port);

console.log("OpportunityClaw plugin loaded");

// Export tools for OpenClaw registration
export { getClients } from "./tools/get-clients";
export { getKeywords } from "./tools/get-keywords";
export { checkSeen } from "./tools/check-seen";
export { markSeen } from "./tools/mark-seen";
export { saveDigest } from "./tools/save-digest";
