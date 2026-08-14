const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  "planId: integer('plan_id'),",
  "planId: integer('plan_id'),\n  paymentDueDate: text('payment_due_date'),"
);

fs.writeFileSync('src/db/schema.ts', code);
