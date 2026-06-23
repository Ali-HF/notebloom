import fs from "fs";
import path from "path";

// Manually load env variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) {
        let val = match[2].trim();
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[match[1]] = val;
      }
    }
  }
} catch (e) {
  console.warn("Failed to load .env.local manually:", e);
}

async function main() {
  console.log("Altering books table to add cover_seed_2...");
  const { sql } = await import("../src/lib/db");
  try {
    await sql`ALTER TABLE books ADD COLUMN cover_seed_2 TEXT;`;
    console.log("Success: added cover_seed_2 column.");
  } catch (e: any) {
    if (e.message.includes("already exists")) {
      console.log("Column cover_seed_2 already exists.");
    } else {
      console.error("Error modifying database table:", e);
      process.exitCode = 1;
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration script failed:", e);
  process.exit(1);
});
