import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { ArrowLeft, Plus, Dumbbell, GripVertical, Edit2, Trash2, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { AddExerciseToWorkoutModal } from './AddExerciseToWorkoutModal.tsx';
import { EditWorkoutModal } from './EditWorkoutModal.tsx';

interface WorkoutDetailsViewProps {
  workout: any;
  onBack: () => void;
  onWorkoutUpdated?: () => void;
}

export function WorkoutDetailsView({ workout, onBack, onWorkoutUpdated }: WorkoutDetailsViewProps) {
  const { user, dbUser } = useAuth();
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isStudent = dbUser?.role === 'ALUNO';

  const fetchWorkoutExercises = async () => {
    try {
      if (!user) return;
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/workouts/${workout.id}/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // sort by orderIndex
        data.sort((a: any, b: any) => a.workoutExercise.orderIndex - b.workoutExercise.orderIndex);
        setWorkoutExercises(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  
  const exportToPDF = () => {
    const element = document.getElementById('workout-pdf-content');
    if (!element) return;
    
    const opt = {
      margin:       0.5,
      filename:     `Treino-${workout.name.replace(/\s+/g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const removeExercise = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este exercício do treino?')) return;
    try {
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/workout-exercises/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchWorkoutExercises();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWorkoutExercises();
  }, [workout.id, user]);

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{workout.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{workout.description || 'Sem descrição'}</p>
          </div>
          {!isStudent && (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="ml-2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Editar Treino"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
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
      </div>
      
      <div id="workout-pdf-content" className="flex-1 p-5 md:p-6 overflow-y-auto bg-white dark:bg-slate-900">
        
        {/* PDF Header - Visible only in PDF via html2pdf styling if we wanted, but let's just make it visible normally or only when printing. Actually let's just add it to the content so it's always there and gets printed */}
        <div className="mb-6 hidden print:block" data-html2canvas-ignore="false">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{workout.name}</h1>
            <p className="text-slate-500">{workout.description}</p>
            <hr className="mt-4 mb-2 border-slate-200" />
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : workoutExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Dumbbell className="w-16 h-16 text-slate-200" />
            <p className="text-center">Nenhum exercício neste treino ainda.
            {!isStudent && <><br/>Clique em "Adicionar Exercício" para começar.</>}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {workoutExercises.map((item, index) => (
              <div key={item.workoutExercise.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800">
                {!isStudent && (
                  <div data-html2canvas-ignore="true" className="cursor-move text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{item.exercise.name}</h3>
                    <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/50 px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400 font-semibold">{item.exercise.muscleGroup}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-medium">Séries:</span>
                      <span className="font-bold text-slate-700">{item.workoutExercise.sets}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-medium">Reps:</span>
                      <span className="font-bold text-slate-700">{item.workoutExercise.reps}</span>
                    </div>
                    {item.workoutExercise.load && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-medium">Carga:</span>
                        <span className="font-bold text-slate-700">{item.workoutExercise.load}</span>
                      </div>
                    )}
                    {item.workoutExercise.restTime && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-medium">Descanso:</span>
                        <span className="font-bold text-slate-700">{item.workoutExercise.restTime}</span>
                      </div>
                    )}
                  </div>
                  {item.workoutExercise.notes && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-white p-2 rounded-lg border border-slate-100 dark:border-blue-500/50">
                      <span className="font-bold">Obs:</span> {item.workoutExercise.notes}
                    </p>
                  )}
                </div>
                {!isStudent && (
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => removeExercise(item.workoutExercise.id)}
                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                    title="Remover exercício"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddExerciseToWorkoutModal 
        workoutId={workout.id}
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchWorkoutExercises}
      />

      <EditWorkoutModal
        workout={workout}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          if (onWorkoutUpdated) onWorkoutUpdated();
        }}
      />
    </div>
  );
}
