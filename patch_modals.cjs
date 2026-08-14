const fs = require('fs');

// AddStudentModal
let addCode = fs.readFileSync('src/components/AddStudentModal.tsx', 'utf8');

addCode = addCode.replace(
  "const [planId, setPlanId] = useState('');",
  "const [planId, setPlanId] = useState('');\n  const [paymentDueDate, setPaymentDueDate] = useState('');"
);

addCode = addCode.replace(
  "planId: planId ? parseInt(planId) : null",
  "planId: planId ? parseInt(planId) : null, paymentDueDate: paymentDueDate || null"
);

addCode = addCode.replace(
  "setPlanId('');",
  "setPlanId('');\n      setPaymentDueDate('');"
);

// Add the paymentDueDate input field inside the form in AddStudentModal
const addFormHTML = `
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Vencimento do Plano</label>
              <input 
                type="date" 
                value={paymentDueDate}
                onChange={e => setPaymentDueDate(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
`;
addCode = addCode.replace('</div>\n          </div>\n          <div className="p-6 border-t', addFormHTML + '          <div className="p-6 border-t');

fs.writeFileSync('src/components/AddStudentModal.tsx', addCode);

// EditStudentModal
let editCode = fs.readFileSync('src/components/EditStudentModal.tsx', 'utf8');

editCode = editCode.replace(
  "const [planId, setPlanId] = useState(student.planId?.toString() || '');",
  "const [planId, setPlanId] = useState(student.planId?.toString() || '');\n  const [paymentDueDate, setPaymentDueDate] = useState(student.paymentDueDate || '');"
);

editCode = editCode.replace(
  "planId: planId ? parseInt(planId) : null",
  "planId: planId ? parseInt(planId) : null, paymentDueDate: paymentDueDate || null"
);

const editFormHTML = `
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Vencimento do Plano</label>
              <input 
                type="date" 
                value={paymentDueDate}
                onChange={e => setPaymentDueDate(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
`;

editCode = editCode.replace('</div>\n          </div>\n          <div className="p-6 border-t', editFormHTML + '          <div className="p-6 border-t');

fs.writeFileSync('src/components/EditStudentModal.tsx', editCode);

console.log("Patched modals.");
