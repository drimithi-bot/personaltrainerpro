import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Activity, LogOut, ChevronRight, Dumbbell, MessageCircle, CalendarCheck, HelpCircle } from 'lucide-react';
import { WorkoutDetailsView } from './WorkoutDetailsView.tsx';

interface StudentDashboardViewProps {
  simulatedStudent?: any;
  onClosePreview?: () => void;
}

export function StudentDashboardView({ simulatedStudent, onClosePreview }: StudentDashboardViewProps = {}) {
  const { user, dbUser, signOut } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'workouts' | 'services'>('workouts');

  const isPreview = !!simulatedStudent;
  const currentStudent = simulatedStudent || dbUser;

  const fetchWorkouts = async () => {
    try {
      if (!user) return;
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      
      let url = '/api/workouts';
      if (isPreview && simulatedStudent) {
        url += `?studentId=${simulatedStudent.id}`;
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
  }, [user]);

  if (selectedWorkout) {
    return (
      <div className="h-screen w-full bg-slate-50 dark:bg-slate-800 flex flex-col font-sans text-slate-900 dark:text-white">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl">A</div>
            <div>
              <h1 className="font-bold">Meu Treino</h1>
              <p className="text-xs text-indigo-200">Personal Pro</p>
            </div>
          </div>
          <button onClick={() => setSelectedWorkout(null)} className="text-slate-400 hover:text-white transition-colors text-sm font-semibold">
            Voltar
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-hidden flex justify-center">
          <div className="w-full max-w-4xl h-full relative">
            <WorkoutDetailsView 
              workout={selectedWorkout} 
              onBack={() => setSelectedWorkout(null)} 
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-800 flex flex-col font-sans text-slate-900 dark:text-white absolute inset-0 z-50">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl">
            {currentStudent?.name?.substring(0, 1).toUpperCase() || 'A'}
          </div>
          <div>
            <h1 className="font-bold">Olá, {currentStudent?.name?.split(' ')[0]}!</h1>
            <p className="text-xs text-indigo-200">{isPreview ? 'Visualização do Personal' : 'Área do Aluno'}</p>
          </div>
        </div>
        {isPreview ? (
          <button onClick={onClosePreview} className="text-slate-400 hover:text-white transition-colors text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg">
            Fechar Preview
          </button>
        ) : (
          <button onClick={signOut} className="text-slate-400 hover:text-white transition-colors p-2">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </header>

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 flex gap-8">
          <button 
            onClick={() => setActiveTab('workouts')}
            className={`py-4 font-bold border-b-2 transition-colors ${activeTab === 'workouts' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Seus Treinos
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`py-4 font-bold border-b-2 transition-colors ${activeTab === 'services' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Atendimento
          </button>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {activeTab === 'workouts' ? (
            <>
              {loading ? (
                <div className="flex justify-center items-center h-48 text-slate-500 dark:text-slate-400">Carregando...</div>
              ) : workouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-blue-500/50 shadow-sm">
                  <Dumbbell className="w-12 h-12 text-slate-200" />
                  <p className="text-center">Nenhum treino programado ainda.<br/>Fale com seu Personal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workouts.map(wk => (
                    <div 
                      key={wk.id} 
                      onClick={() => setSelectedWorkout(wk)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/50 p-6 rounded-3xl hover:border-indigo-400 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col min-h-[140px] group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors">{wk.name}</h3>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                      </div>
                      {wk.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{wk.description}</p>}
                      <div className="text-xs font-bold text-indigo-600 mt-auto uppercase tracking-wider bg-indigo-50 self-start px-3 py-1.5 rounded-lg">
                        Iniciar Treino
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Agendar Avaliação</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Agende sua avaliação física ou reavaliação para acompanharmos seu progresso e ajustarmos seus treinos.
                </p>
                <a 
                  href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20agendar%20minha%20avaliação%20física." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors mt-auto flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Agendar Agora
                </a>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Conversar sobre Planos</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Quer mudar de plano, adicionar consultoria nutricional ou tirar dúvidas sobre pagamentos? Fale comigo.
                </p>
                <a 
                  href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20conversar%20sobre%20os%20planos%20de%20treinamento." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors mt-auto flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
