import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Load .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function migrate() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/puqme"
  });

  try {
    await client.connect();
    console.log("Connected to database.");
    
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;
      CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users (google_sub) WHERE google_sub IS NOT NULL;
    `);
    
    console.log("Migration successful: added google_sub column.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
