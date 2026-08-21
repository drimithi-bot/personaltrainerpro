import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";

async function run() {
  const allUsers = await db.select().from(users);
  console.log("Current Users in DB:");
  allUsers.forEach(u => console.log(`ID: ${u.id} | Name: ${u.name} | Role: ${u.role}`));
}
run();
