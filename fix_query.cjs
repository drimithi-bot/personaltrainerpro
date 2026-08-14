const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'planId: studentProfiles.planId,\n        paymentDueDate,\n          paymentDueDate: studentProfiles.paymentDueDate,',
  'planId: studentProfiles.planId,\n          paymentDueDate: studentProfiles.paymentDueDate,'
);

fs.writeFileSync('server.ts', code);
