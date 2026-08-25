const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const { slug, bio, location, instagram, whatsapp, enableBooking, bookingStartTime, bookingEndTime, bookingDays } = req.body;",
  "const { slug, bio, location, instagram, whatsapp, enableBooking, bookingStartTime, bookingEndTime, bookingDays, heroImageUrl, heroImagePosition } = req.body;"
);

code = code.replace(
  "await db.insert(publicProfiles).values({",
  "await db.insert(publicProfiles).values({\n          heroImageUrl,\n          heroImagePosition,"
);

code = code.replace(
  "await db.update(publicProfiles).set({",
  "await db.update(publicProfiles).set({\n          heroImageUrl,\n          heroImagePosition,"
);

fs.writeFileSync('server.ts', code);
