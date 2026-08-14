import { db } from './src/db/index.ts';
import { publicProfiles } from './src/db/schema.ts';
async function run() {
  const profiles = await db.select().from(publicProfiles);
  console.log(profiles);
}
run();
