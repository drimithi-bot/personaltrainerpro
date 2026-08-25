const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  "bookingDays: text('booking_days').default('1,2,3,4,5'),",
  "bookingDays: text('booking_days').default('1,2,3,4,5'),\n  heroImageUrl: text('hero_image_url'),\n  heroImagePosition: text('hero_image_position').default('background'),"
);

fs.writeFileSync('src/db/schema.ts', code);
