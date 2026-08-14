const fs = require('fs');
let code = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');

const mapStart = "            {students.map(student => (";
const mapReplacement = `            {students.map(student => {
              const isOverdue = student.paymentDueDate && student.paymentDueDate < new Date().toISOString().split('T')[0];
              return (`;

code = code.replace(mapStart, mapReplacement);

const mapEnd = `                </div>
              ))
            )}`;
const mapEndReplacement = `                </div>
              );
            })
            )}`;

code = code.replace(mapEnd, mapEndReplacement);

const planBadge = `                  {student.planId && (
                    <span className="inline-block mt-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {DEFAULT_PLANS.find(p => p.id === student.planId)?.frequency || 'Plano Personalizado'}
                    </span>
                  )}`;

const newBadges = `                  {student.planId && (
                    <span className="inline-block mt-1 mr-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {DEFAULT_PLANS.find(p => p.id === student.planId)?.frequency || 'Plano Personalizado'}
                    </span>
                  )}
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Pagamento Atrasado
                    </span>
                  )}`;

code = code.replace(planBadge, newBadges);

// Also we need to make sure we imported AlertCircle
if (!code.includes('AlertCircle')) {
  code = code.replace(
    "import { Plus, Users, Eye, Edit2, Activity } from 'lucide-react';",
    "import { Plus, Users, Eye, Edit2, Activity, AlertCircle } from 'lucide-react';"
  );
}

fs.writeFileSync('src/components/StudentsView.tsx', code);
