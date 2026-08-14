const fs = require('fs');
let code = fs.readFileSync('src/components/EditStudentModal.tsx', 'utf8');

code = code.replace(
  "const [planId, setPlanId] = useState('');",
  "const [planId, setPlanId] = useState('');\n  const [paymentDueDate, setPaymentDueDate] = useState('');"
);

code = code.replace(
  "setPlanId(student.planId ? String(student.planId) : '');",
  "setPlanId(student.planId ? String(student.planId) : '');\n      setPaymentDueDate(student.paymentDueDate || '');"
);

fs.writeFileSync('src/components/EditStudentModal.tsx', code);
