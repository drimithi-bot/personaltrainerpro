import { db } from "./src/db/index.ts";
import { users } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";
import * as admin from "firebase-admin";
// Let's not use firebase admin, let's just bypass requireAuth locally to test it.
