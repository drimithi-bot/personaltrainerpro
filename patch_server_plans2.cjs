const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newPut = `
  app.put("/api/plans", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      const { plans: updatedPlans } = req.body;
      
      if (!Array.isArray(updatedPlans)) {
         return res.status(400).json({ error: "Invalid plans payload" });
      }

      // Upsert plans
      const existingPlans = await db.select().from(plans).where(eq(plans.tenantId, tenantId));
      
      for (const p of updatedPlans) {
        if (p.id && existingPlans.find(ep => ep.id === p.id)) {
          // Update
          await db.update(plans).set({
            frequency: p.frequency,
            price: p.price,
            description: p.description,
            popular: p.popular
          }).where(and(eq(plans.id, p.id), eq(plans.tenantId, tenantId)));
        } else {
          // Insert
          await db.insert(plans).values({
            tenantId,
            frequency: p.frequency,
            price: p.price,
            description: p.description,
            popular: p.popular
          });
        }
      }
      
      // Delete removed plans
      const updatedIds = updatedPlans.filter(p => p.id).map(p => p.id);
      for (const ep of existingPlans) {
        if (!updatedIds.includes(ep.id)) {
          await db.delete(plans).where(and(eq(plans.id, ep.id), eq(plans.tenantId, tenantId)));
        }
      }
      
      res.json({ message: "Planos atualizados" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
`;

const startIndex = code.indexOf('app.put("/api/plans"');
const endIndex = code.indexOf('app.get("/api/p/:slug",');
code = code.substring(0, startIndex) + newPut + code.substring(endIndex);

fs.writeFileSync('server.ts', code);
