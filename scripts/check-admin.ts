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
  const { sql } = await import("../src/lib/db");
  const users = await sql`SELECT id, name, email, email_verified, is_admin FROM users`;
  console.log("ALL USERS:", users);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
