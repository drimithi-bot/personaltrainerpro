const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

const oldLine = "bookingEndTime: text('booking_end_time').default('20:00'),";
const newLine = "bookingEndTime: text('booking_end_time').default('20:00'),\n  bookingDays: text('booking_days').default('1,2,3,4,5'),";

code = code.replace(oldLine, newLine);
fs.writeFileSync('src/db/schema.ts', code);
