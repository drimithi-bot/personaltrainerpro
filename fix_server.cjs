const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I'll extract everything before app.get("/api/p/:slug/availability"
const idxStart = code.indexOf('app.get("/api/p/:slug/availability"');
const idxEnd = code.indexOf('// Public booking submit');

const preCode = code.substring(0, idxStart);
const postCode = code.substring(idxEnd);

const fixedGet = `app.get("/api/p/:slug/availability", async (req, res) => {
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
      const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();

      // Check if day is allowed
      const allowedDays = (profile[0].bookingDays || '1,2,3,4,5').split(',').map(Number);
      if (!allowedDays.includes(dayOfWeek) || profile[0].enableBooking === false) {
        return res.json([]);
      }

      const blocked = await db.select().from(blockedTimes).where(
        and(eq(blockedTimes.tenantId, tenantId), eq(blockedTimes.dayOfWeek, dayOfWeek))
      );

      const existingAppointments = await db.select().from(appointments).where(
        and(eq(appointments.tenantId, tenantId), eq(appointments.date, date as string))
      );

      // Generate 1-hour slots from bookingStartTime to bookingEndTime
      const startHour = parseInt(profile[0].bookingStartTime?.split(':')[0] || '7');
      const endHour = parseInt(profile[0].bookingEndTime?.split(':')[0] || '20');
      const slots = [];
      for (let hour = startHour; hour <= endHour; hour++) {
        const hStr = hour.toString().padStart(2, '0') + ':00';
        slots.push(hStr);
      }

      // Helper to check if a slot overlaps with a time range
      const isOverlapping = (slotTime, start, end) => {
        const slotHour = parseInt(slotTime.split(':')[0]);
        const slotEnd = (slotHour + 1).toString().padStart(2, '0') + ':00';
        return (slotTime < end && slotEnd > start);
      };

      const availableSlots = slots.filter(slot => {
        // Check blocked times
        for (const b of blocked) {
          if (isOverlapping(slot, b.startTime, b.endTime)) return false;
        }
        // Check existing appointments
        for (const app of existingAppointments) {
          if (isOverlapping(slot, app.startTime, app.endTime) && app.status !== 'CANCELLED') return false;
        }
        return true;
      });

      res.json(availableSlots);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  `;

fs.writeFileSync('server.ts', preCode + fixedGet + postCode);
