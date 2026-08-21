const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const validationCode = `
      const tenantId = profile[0].tenantId;

      // Validate date and time against profile settings
      const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
      const allowedDays = (profile[0].bookingDays || '1,2,3,4,5').split(',').map(Number);
      if (!allowedDays.includes(dayOfWeek) || profile[0].enableBooking === false) {
        return res.status(400).json({ error: "Este dia não está disponível para agendamento." });
      }

      const startHour = parseInt(profile[0].bookingStartTime?.split(':')[0] || '7');
      const endHour = parseInt(profile[0].bookingEndTime?.split(':')[0] || '20');
      const requestHour = parseInt(time.split(':')[0]);

      if (requestHour < startHour || requestHour > endHour) {
        return res.status(400).json({ error: "Este horário não está dentro do período de atendimento." });
      }

      // Helper to check overlap
      const isOverlapping = (slotTime, start, end) => {
        const slotHour = parseInt(slotTime.split(':')[0]);
        const slotEnd = (slotHour + 1).toString().padStart(2, '0') + ':00';
        return (slotTime < end && slotEnd > start);
      };

      // Check blocked times
      const blocked = await db.select().from(blockedTimes).where(
        and(eq(blockedTimes.tenantId, tenantId), eq(blockedTimes.dayOfWeek, dayOfWeek))
      );

      for (const b of blocked) {
        if (isOverlapping(time, b.startTime, b.endTime)) {
          return res.status(400).json({ error: "Este horário encontra-se bloqueado." });
        }
      }

      // Check existing appointments
      const existingAppointments = await db.select().from(appointments).where(
        and(eq(appointments.tenantId, tenantId), eq(appointments.date, date as string))
      );

      for (const app of existingAppointments) {
         if (isOverlapping(time, app.startTime, app.endTime) && app.status !== 'CANCELLED') {
           return res.status(400).json({ error: "Este horário já está reservado." });
         }
      }
`;

code = code.replace(
  '      const tenantId = profile[0].tenantId;',
  validationCode
);

fs.writeFileSync('server.ts', code);
