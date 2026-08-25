import { db } from "./src/db/index.ts";
import { publicProfiles } from "./src/db/schema.ts";

async function run() {
  try {
    const res = await db.select().from(publicProfiles).limit(1);
    console.log("Profile row:", res);
  } catch(e) {
    console.error(e);
  }
}
run();
