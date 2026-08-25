import { db } from "./src/db/index.ts";
import { sql } from "drizzle-orm";

async function run() {
  try {
    await db.execute(sql`
      ALTER TABLE public_profiles 
      ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
      ADD COLUMN IF NOT EXISTS hero_image_position TEXT DEFAULT 'background';
    `);
    console.log("Table altered successfully!");
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
