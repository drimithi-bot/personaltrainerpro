import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Plus, Activity, ChevronRight, ArrowLeft } from 'lucide-react';
import { WorkoutDetailsView } from './WorkoutDetailsView.tsx';
import { CreateWorkoutModal } from './CreateWorkoutModal.tsx';

interface WorkoutsViewProps {
  student?: any;
  onBack?: () => void;
}

export function WorkoutsView({ student, onBack }: WorkoutsViewProps = {}) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchWorkouts = async () => {
    try {
      if (!user) return;
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      
      let url = '/api/workouts';
      if (student) {
        url += `?studentId=${student.id}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user, student]);

  if (selectedWorkout) {
    return (
      <WorkoutDetailsView 
        workout={selectedWorkout} 
        onBack={() => setSelectedWorkout(null)} 
        onWorkoutUpdated={() => {
          setSelectedWorkout(null);
          fetchWorkouts();
        }}
      />
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {student ? `Treinos de ${student.name}` : 'Treinos'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {student ? 'Gerencie a série deste aluno' : 'Gerencie os treinos dos seus alunos'}
            </p>
          </div>
        </div>
        
        {student && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Treino
          </button>
        )}
      </div>
      
      <div className="flex-1 p-5 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Activity className="w-16 h-16 text-slate-200" />
            <p className="text-center">Nenhum treino criado.<br/>{student ? 'Clique em Novo Treino para começar.' : 'Crie treinos na aba Dashboard ou dentro do perfil do aluno.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map(wk => (
              <div 
                key={wk.id} 
                onClick={() => setSelectedWorkout(wk)}
                className="border border-slate-200 dark:border-blue-500/50 p-5 rounded-2xl hover:border-indigo-300 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50/30 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 transition-colors">{wk.name}</h3>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                </div>
                {wk.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{wk.description}</p>}
                <div className="text-xs font-semibold text-slate-400 mt-auto uppercase tracking-wider">
                  Ver detalhes e exercícios
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {student && (
        <CreateWorkoutModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchWorkouts();
          }}
          prefilledStudentId={student.id}
        />
      )}
    </div>
  );
}
