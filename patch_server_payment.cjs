const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'planId: studentProfiles.planId,',
  'planId: studentProfiles.planId,\n          paymentDueDate: studentProfiles.paymentDueDate,'
);

code = code.replace(
  'const { name, email, phone, birthDate, gender, profession, emergencyContact, planId } = req.body;',
  'const { name, email, phone, birthDate, gender, profession, emergencyContact, planId, paymentDueDate } = req.body;'
);

code = code.replace(
  'planId,',
  'planId,\n        paymentDueDate,'
);

code = code.replace(
  'const { name, email, phone, planId } = req.body;',
  'const { name, email, phone, planId, paymentDueDate } = req.body;'
);

code = code.replace(
  'planId: planId !== undefined ? planId : existingProfile[0].planId,',
  'planId: planId !== undefined ? planId : existingProfile[0].planId,\n          paymentDueDate: paymentDueDate !== undefined ? paymentDueDate : existingProfile[0].paymentDueDate,'
);

// We should also replace the other planId, from the insert in PUT
code = code.replace(
  'tenantId,\n          planId,\n        });',
  'tenantId,\n          planId,\n          paymentDueDate,\n        });'
);


fs.writeFileSync('server.ts', code);
