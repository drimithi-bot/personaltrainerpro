const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update imports
code = code.replace(
  'import { users, tenants, studentProfiles, publicProfiles, notifications, appointments, blockedTimes } from "./src/db/schema.ts";',
  'import { users, tenants, studentProfiles, publicProfiles, notifications, appointments, blockedTimes, plans } from "./src/db/schema.ts";'
);

// Add plans endpoints
const plansEndpoints = `
  app.get("/api/plans", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      
      const tenantPlans = await db.select().from(plans).where(eq(plans.tenantId, tenantId)).orderBy(plans.id);
      res.json(tenantPlans);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/plans", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      const { plans: updatedPlans } = req.body;
      
      if (!Array.isArray(updatedPlans)) {
         return res.status(400).json({ error: "Invalid plans payload" });
      }

      // Delete existing plans and insert new ones
      await db.delete(plans).where(eq(plans.tenantId, tenantId));
      
      if (updatedPlans.length > 0) {
        await db.insert(plans).values(
          updatedPlans.map(p => ({
            tenantId,
            frequency: p.frequency,
            price: p.price,
            description: p.description,
            popular: p.popular
          }))
        );
      }
      
      res.json({ message: "Planos atualizados" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
`;

// Insert before `app.get("/api/p/:slug",`
const slugGetIdx = code.indexOf('app.get("/api/p/:slug"');
code = code.substring(0, slugGetIdx) + plansEndpoints + code.substring(slugGetIdx);

// Modify `app.get("/api/p/:slug",` to include plans
const oldResJson = `      res.json({
        name: profile[0].user.name,
        photoUrl: profile[0].user.photoUrl,
        ...profile[0].profile
      });`;

const newResJson = `      const tenantPlans = await db.select().from(plans).where(eq(plans.tenantId, profile[0].profile.tenantId)).orderBy(plans.id);

      res.json({
        name: profile[0].user.name,
        photoUrl: profile[0].user.photoUrl,
        plans: tenantPlans,
        ...profile[0].profile
      });`;

code = code.replace(oldResJson, newResJson);

fs.writeFileSync('server.ts', code);
