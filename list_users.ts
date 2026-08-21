import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";

async function run() {
  const allUsers = await db.select().from(users);
  console.log("All users:");
  allUsers.forEach(u => console.log(u.id, u.name, u.role, u.tenantId));
}
run();
