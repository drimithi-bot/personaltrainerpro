const fs = require('fs');

let code = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');

// Import Trash2
code = code.replace(
  "import { Plus, Users, Eye, Edit2, Activity, AlertCircle } from 'lucide-react';",
  "import { Plus, Users, Eye, Edit2, Activity, AlertCircle, Trash2 } from 'lucide-react';"
);

// Add handleDelete function
const deleteFunc = `
  const handleDelete = async (student: any) => {
    if (window.confirm(\`Tem certeza que deseja excluir o aluno \${student.name}? Esta ação não pode ser desfeita e excluirá todos os treinos e agendamentos vinculados.\`)) {
      try {
        const { auth } = await import('../lib/firebase.ts');
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(\`/api/students/\${student.id}\`, {
          method: 'DELETE',
          headers: { Authorization: \`Bearer \${token}\` }
        });
        if (res.ok) {
          fetchStudents();
        } else {
          const data = await res.json();
          alert(data.error || 'Erro ao excluir aluno');
        }
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir aluno');
      }
    }
  };
`;

code = code.replace(
  '  const fetchStudents = async () => {',
  deleteFunc + '\n  const fetchStudents = async () => {'
);

// Add the button
// Let's find where the edit button is
const buttonSearch = '<button onClick={() => setEditingStudent(student)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">';
const deleteBtn = `
                    <button onClick={() => handleDelete(student)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                      <Trash2 className="w-5 h-5" />
                    </button>`;

code = code.replace(
  buttonSearch,
  deleteBtn + '\n                    ' + buttonSearch
);

fs.writeFileSync('src/components/StudentsView.tsx', code);
