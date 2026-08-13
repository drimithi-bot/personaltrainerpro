import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Plus, Dumbbell, PlayCircle } from 'lucide-react';
import { AddExerciseModal } from './AddExerciseModal.tsx';

export function ExercisesView() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchExercises = async () => {
    try {
      if (!user) return;
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/exercises', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [user]);

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Biblioteca de Exercícios</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie seu catálogo de exercícios</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Exercício
        </button>
      </div>
      
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Dumbbell className="w-16 h-16 text-slate-200" />
            <p className="text-center">Nenhum exercício cadastrado.<br/>Adicione seu primeiro exercício à biblioteca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map(ex => (
              <div key={ex.id} className="border border-slate-200 dark:border-blue-500/50 p-4 rounded-2xl hover:border-indigo-200 transition-colors bg-slate-50 dark:bg-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{ex.name}</h3>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-lg font-semibold">
                    {ex.muscleGroup}
                  </span>
                </div>
                {ex.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{ex.description}</p>}
                {ex.videoUrl && (
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-auto">
                    <PlayCircle className="w-4 h-4" />
                    Com vídeo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddExerciseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchExercises}
      />
    </div>
  );
}
