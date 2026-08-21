import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";
// We don't have token, so let's just make a mock request object and call the endpoint handler
