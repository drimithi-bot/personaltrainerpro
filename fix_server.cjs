const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const originalOverlap = `      const isOverlapping = (slotTime, start, end) => {
        return slotTime >= start && slotTime < end;
      };`;

const newOverlap = `      const isOverlapping = (slotTime, start, end) => {
        const slotHour = parseInt(slotTime.split(':')[0]);
        const slotEnd = (slotHour + 1).toString().padStart(2, '0') + ':00';
        return (slotTime < end && slotEnd > start);
      };`;

code = code.replace(originalOverlap, newOverlap);

const originalDayOfWeek = `const dayOfWeek = new Date(date + 'T00:00:00').getDay();`;
const newDayOfWeek = `const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();`;

code = code.replace(originalDayOfWeek, newDayOfWeek);

fs.writeFileSync('server.ts', code);
