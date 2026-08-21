const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(
  'import { users, tenants, studentProfiles, publicProfiles, notifications, appointments, blockedTimes, plans, studentSchedules } from "./src/db/schema.ts";',
  'import { users, tenants, studentProfiles, publicProfiles, notifications, appointments, blockedTimes, plans, studentSchedules, workouts, workoutExercises } from "./src/db/schema.ts";'
);

serverCode = serverCode.replace(
  'import { eq, and, desc } from "drizzle-orm";',
  'import { eq, and, desc, inArray } from "drizzle-orm";'
);

serverCode = serverCode.replace(
  'const { workouts, workoutExercises } = await import("./src/db/schema.ts");\n      const { inArray } = await import("drizzle-orm");',
  ''
);

fs.writeFileSync('server.ts', serverCode);
