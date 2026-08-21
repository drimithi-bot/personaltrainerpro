const fs = require('fs');
let code = fs.readFileSync('src/components/WorkoutDetailsView.tsx', 'utf8');

// Imports
code = code.replace(
  "import { ArrowLeft, Plus, Dumbbell, GripVertical, Edit2, Trash2 } from 'lucide-react';",
  "import { ArrowLeft, Plus, Dumbbell, GripVertical, Edit2, Trash2, Download } from 'lucide-react';\nimport html2pdf from 'html2pdf.js';"
);

// Add export function
const exportFn = `
  const exportToPDF = () => {
    const element = document.getElementById('workout-pdf-content');
    if (!element) return;
    
    const opt = {
      margin:       0.5,
      filename:     \`Treino-\${workout.name.replace(/\\s+/g, '-')}.pdf\`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
`;

code = code.replace(
  "const removeExercise = async (id: number) => {",
  exportFn + "\n  const removeExercise = async (id: number) => {"
);

// Add button to header
const headerButtonsOld = `        {!isStudent && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Exercício
          </button>
        )}
      </div>`;

const headerButtonsNew = `        <div className="flex items-center gap-2">
          <button 
            onClick={exportToPDF}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          {!isStudent && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Exercício</span>
            </button>
          )}
        </div>
      </div>`;

code = code.replace(headerButtonsOld, headerButtonsNew);

// Add ID to content and ignore tags
code = code.replace(
  '<div className="flex-1 p-5 md:p-6 overflow-y-auto">',
  '<div id="workout-pdf-content" className="flex-1 p-5 md:p-6 overflow-y-auto bg-white dark:bg-slate-900">'
);

// Add a visible title in the PDF content (so it looks good when printed)
code = code.replace(
  '{loading ? (',
  `
        {/* PDF Header - Visible only in PDF via html2pdf styling if we wanted, but let's just make it visible normally or only when printing. Actually let's just add it to the content so it's always there and gets printed */}
        <div className="mb-6 hidden print:block" data-html2canvas-ignore="false">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{workout.name}</h1>
            <p className="text-slate-500">{workout.description}</p>
            <hr className="mt-4 mb-2 border-slate-200" />
        </div>
        {loading ? (`
);


// Exclude grip and trash icons from PDF
code = code.replace(
  '<div className="cursor-move text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors">',
  '<div data-html2canvas-ignore="true" className="cursor-move text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors">'
);

code = code.replace(
  '<button \n                    onClick={() => removeExercise(item.workoutExercise.id)}\n                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors ml-auto"\n                    title="Remover exercício"\n                  >',
  '<button \n                    data-html2canvas-ignore="true"\n                    onClick={() => removeExercise(item.workoutExercise.id)}\n                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors ml-auto"\n                    title="Remover exercício"\n                  >'
);

fs.writeFileSync('src/components/WorkoutDetailsView.tsx', code);
