import { db } from "./src/db/index.ts";
import { sql } from "drizzle-orm";

async function run() {
  try {
    const res = await db.execute(sql`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='users';
    `);
    console.log("Foreign keys to users:", res.rows);
  } catch(e) {
    console.error(e);
  }
}
run();
