const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. In GET /api/public-profile
code = code.replace(
  "bookingEndTime: '20:00'",
  "bookingEndTime: '20:00',\n          bookingDays: '1,2,3,4,5'"
);

// 2. In PUT /api/public-profile
code = code.replace(
  "bookingEndTime } = req.body;",
  "bookingEndTime, bookingDays } = req.body;"
);

code = code.replace(
  "bookingEndTime: bookingEndTime || '20:00',",
  "bookingEndTime: bookingEndTime || '20:00',\n          bookingDays: bookingDays || '1,2,3,4,5',"
);

// 3. In GET /api/p/:slug/availability
// The user might be getting no slots because profile.enableBooking is explicitly false or null. 
// Wait, if enableBooking is null, profile[0].enableBooking !== false will be true. 
// But what if it's "0" or something? No, it's boolean.
// We also need to check the selected dayOfWeek against bookingDays.

const oldAvail = `      const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();

      const blocked = await db.select().from(blockedTimes).where(`;

const newAvail = `      const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();

      // Check if day is allowed
      const allowedDays = (profile[0].bookingDays || '1,2,3,4,5').split(',').map(Number);
      if (!allowedDays.includes(dayOfWeek) || profile[0].enableBooking === false) {
        return res.json([]);
      }

      const blocked = await db.select().from(blockedTimes).where(`;

code = code.replace(oldAvail, newAvail);

fs.writeFileSync('server.ts', code);
