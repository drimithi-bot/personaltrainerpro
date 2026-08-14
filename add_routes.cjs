const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routes = `
  // Appointments
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const { appointments } = await import("./src/db/schema.ts");
      
      const query = db.select().from(appointments)
        .where(eq(appointments.tenantId, req.dbUser.tenantId));
        
      const results = await query;
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can create appointments" });
      }
      
      const { studentId, date, startTime, endTime, notes } = req.body;
      const { appointments } = await import("./src/db/schema.ts");
      
      // Check for overlapping appointments
      const existing = await db.select().from(appointments)
        .where(and(
          eq(appointments.tenantId, req.dbUser.tenantId),
          eq(appointments.date, date)
        ));
      
      // Basic time overlap check
      const hasOverlap = existing.some(app => {
        // A overlaps B if A starts before B ends AND A ends after B starts
        return (startTime < app.endTime && endTime > app.startTime) && app.status !== 'CANCELLED';
      });
      
      if (hasOverlap) {
        return res.status(400).json({ error: "Já existe um agendamento neste horário." });
      }
      
      const newAppointment = await db.insert(appointments).values({
        tenantId: req.dbUser.tenantId,
        studentId,
        date,
        startTime,
        endTime,
        notes
      }).returning();
      
      res.json(newAppointment[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can delete appointments" });
      }
      const id = parseInt(req.params.id, 10);
      const { appointments } = await import("./src/db/schema.ts");
      
      await db.delete(appointments)
        .where(and(
          eq(appointments.id, id),
          eq(appointments.tenantId, req.dbUser.tenantId)
        ));
        
      res.json({ message: "Appointment deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
`;

code = code.replace('// Vite middleware for development', routes + '\n  // Vite middleware for development');
fs.writeFileSync('server.ts', code);
