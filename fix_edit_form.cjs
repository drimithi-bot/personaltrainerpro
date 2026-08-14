const fs = require('fs');
let code = fs.readFileSync('src/components/EditStudentModal.tsx', 'utf8');

const injection = `
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Vencimento do Plano</label>
            <input 
              type="date" 
              value={paymentDueDate}
              onChange={e => setPaymentDueDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="pt-4 mt-2 border-t`;

code = code.replace(
  '<div className="pt-4 mt-2 border-t',
  injection
);

fs.writeFileSync('src/components/EditStudentModal.tsx', code);
