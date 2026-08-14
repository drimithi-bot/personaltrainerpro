const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const availabilityRoutes = `
  // Public booking availability
  app.get("/api/p/:slug/availability", async (req, res) => {
    try {
      const { slug } = req.params;
      const { date } = req.query; // YYYY-MM-DD
      
      if (!date) {
        return res.status(400).json({ error: "Date is required" });
      }

      const profile = await db.select().from(publicProfiles).where(eq(publicProfiles.slug, slug)).limit(1);
      if (profile.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const tenantId = profile[0].tenantId;
      const dayOfWeek = new Date(date + 'T00:00:00').getDay();

      const blocked = await db.select().from(blockedTimes).where(
        and(eq(blockedTimes.tenantId, tenantId), eq(blockedTimes.dayOfWeek, dayOfWeek))
      );

      const existingAppointments = await db.select().from(appointments).where(
        and(eq(appointments.tenantId, tenantId), eq(appointments.date, date as string))
      );

      // Generate 1-hour slots from 07:00 to 20:00
      const slots = [];
      for (let hour = 7; hour <= 20; hour++) {
        const hStr = hour.toString().padStart(2, '0') + ':00';
        slots.push(hStr);
      }

      // Helper to check if a slot overlaps with a time range
      const isOverlapping = (slotTime, start, end) => {
        return slotTime >= start && slotTime < end;
      };

      const availableSlots = slots.filter(slot => {
        // Check blocked times
        for (const b of blocked) {
          if (isOverlapping(slot, b.startTime, b.endTime)) return false;
        }
        // Check appointments (assume 1 hour duration for simplicity)
        const slotEnd = (parseInt(slot.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
        for (const app of existingAppointments) {
          // If appointment overlaps with this slot
          if (app.status !== 'CANCELLED' && 
              ((slot >= app.startTime && slot < app.endTime) || 
               (app.startTime >= slot && app.startTime < slotEnd))) {
            return false;
          }
        }
        return true;
      });

      res.json(availableSlots);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Public booking submit
  app.post("/api/p/:slug/book", async (req, res) => {
    try {
      const { slug } = req.params;
      const { date, time, name, email, phone, notes } = req.body;

      if (!date || !time || !name || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const profile = await db.select().from(publicProfiles).where(eq(publicProfiles.slug, slug)).limit(1);
      if (profile.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const tenantId = profile[0].tenantId;

      // Create a lead user if it doesn't exist
      let user = await db.select().from(users).where(
        and(eq(users.tenantId, tenantId), eq(users.email, email))
      ).limit(1);

      let userId;
      if (user.length === 0) {
        const pseudoUid = \`lead_\${crypto.randomUUID()}\`;
        const newUser = await db.insert(users).values({
          uid: pseudoUid,
          email,
          name,
          phone: phone || '',
          role: "ALUNO", // Treat as ALUNO for CRM purposes
          tenantId,
        }).returning();
        userId = newUser[0].id;
        
        await db.insert(studentProfiles).values({
          userId,
          tenantId,
        });
      } else {
        userId = user[0].id;
      }

      // Calculate endTime (assume 1 hour duration)
      const endHour = (parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0');
      const endTime = \`\${endHour}:00\`;

      await db.insert(appointments).values({
        tenantId,
        studentId: userId,
        date,
        startTime: time,
        endTime,
        notes: \`Consulta via Página Pública\${notes ? ': ' + notes : ''}\`,
        status: 'SCHEDULED'
      });

      res.json({ message: "Consulta agendada com sucesso!" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
`;

code = code.replace("app.get(\"/api/p/:slug\",", availabilityRoutes + "\n  app.get(\"/api/p/:slug\",");

fs.writeFileSync('server.ts', code);
