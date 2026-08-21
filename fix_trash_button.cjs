const fs = require('fs');
let code = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');

const target = 'onClick={() => setEditingStudent(student)}';
const replacement = `onClick={() => handleDelete(student)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Excluir aluno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingStudent(student)}`;

if (code.includes(target) && !code.includes('Excluir aluno')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/StudentsView.tsx', code);
  console.log("Button inserted.");
} else {
  console.log("Target not found or button already exists.");
}
