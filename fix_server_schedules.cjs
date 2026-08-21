const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix imports
code = code.replace(
  'import { users, tenants, studentProfiles, publicProfiles, notifications, appointments, blockedTimes, plans } from "./src/db/schema.ts";',
  'import { users, tenants, studentProfiles, publicProfiles, notifications, appointments, blockedTimes, plans, studentSchedules } from "./src/db/schema.ts";'
);

const schedulesApi = `
  app.get("/api/schedules", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      
      const schedules = await db.select().from(studentSchedules).where(eq(studentSchedules.tenantId, tenantId));
      res.json(schedules);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/students", requireAuth, async (req: AuthRequest, res) => {`;

code = code.replace(
  '  app.get("/api/students", requireAuth, async (req: AuthRequest, res) => {',
  schedulesApi
);

fs.writeFileSync('server.ts', code);
