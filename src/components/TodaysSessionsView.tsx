import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Calendar, User, Activity, Clock } from 'lucide-react';

export function TodaysSessionsView({ onViewWorkouts }: { onViewWorkouts?: (student: any) => void }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const { auth } = await import('../lib/firebase.ts');
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const [resStudents, resWorkouts] = await Promise.all([
          fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/workouts', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (resStudents.ok && resWorkouts.ok) {
          const students = await resStudents.json();
          const workouts = await resWorkouts.json();
          
          // Filter students who have at least one workout assigned to them
          const todaysSessions = students.filter((s: any) => 
            workouts.some((w: any) => w.studentId === s.id)
          ).map((s: any) => {
            const studentWorkouts = workouts.filter((w: any) => w.studentId === s.id);
            return {
              ...s,
              workouts: studentWorkouts
            };
          });
          
          setSessions(todaysSessions);
        }
      } catch (e) {
        console.error('Failed to fetch sessions data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden transition-colors">
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sessões de Hoje</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Alunos com treinos agendados para hoje</p>
        </div>
      </div>
      
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Calendar className="w-16 h-16 text-slate-200 dark:text-slate-700" />
            <p className="text-center">Nenhuma sessão agendada para hoje.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => onViewWorkouts && onViewWorkouts(session)}
                className="border border-slate-200 dark:border-slate-700 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-lg shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                    {session.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{session.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hoje
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Treinos ({session.workouts.length})
                  </p>
                  <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                    {session.workouts.map((w: any) => (
                      <li key={w.id} className="truncate">• {w.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
