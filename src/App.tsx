/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider.tsx';
import { LogIn, UserPlus, Dumbbell, LayoutDashboard, Users, Calendar, Settings, LogOut, AlertCircle, Search, Activity, BookOpen, DollarSign, Sun, Moon, Bell, CheckCircle } from 'lucide-react';
import { formatPhone } from './lib/utils.ts';
import { AddStudentModal } from './components/AddStudentModal.tsx';
import { CreateWorkoutModal } from './components/CreateWorkoutModal.tsx';
import { ExercisesView } from './components/ExercisesView.tsx';
import { WorkoutsView } from './components/WorkoutsView.tsx';
import { StudentsView } from './components/StudentsView.tsx';
import { PublicTrainerProfileView } from './components/PublicTrainerProfileView.tsx';
import { SaaSMarketingView } from './components/SaaSMarketingView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { ViewWorkoutModal } from './components/ViewWorkoutModal.tsx';
import { PricingView } from './components/PricingView.tsx';
import { TodaysSessionsView } from './components/TodaysSessionsView.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { StudentDashboardView } from './components/StudentDashboardView.tsx';

function DashboardRouter() {
  const { user, dbUser, loading, signIn, registerPersonal, signOut } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateWorkoutOpen, setIsCreateWorkoutOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { auth } = await import('./lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };


  const confirmBooking = async (id: number) => {
    try {
      const { auth } = await import('./lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch(`/api/notifications/${id}/confirm`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, message: n.message + ' (Confirmado)' } : n));
        fetchDashboardData();
      }
    } catch (e) {
      console.error('Failed to confirm booking', e);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      const { auth } = await import('./lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  useEffect(() => {
    if (dbUser?.role === 'PERSONAL') {
      fetchNotifications();
      // Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [dbUser]);

  const [studentsCount, setStudentsCount] = useState(0);
  
  const [simulatedStudent, setSimulatedStudent] = useState<any>(null);
  const [studentForWorkouts, setStudentForWorkouts] = useState<any>(null);
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  const [dashboardData, setDashboardData] = useState<{students: any[], workouts: any[], appointments: any[]}>({ students: [], workouts: [], appointments: [] });
  const [selectedDashboardWorkout, setSelectedDashboardWorkout] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      if (!user) return;
      const { auth } = await import('./lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const [resStudents, resWorkouts, resAppointments] = await Promise.all([
        fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/workouts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (resStudents.ok && resWorkouts.ok && resAppointments.ok) {
        const students = await resStudents.json();
        const workouts = await resWorkouts.json();
        const appointments = await resAppointments.json();
        setStudentsCount(students.length);
        setDashboardData({ students, workouts, appointments });
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    }
  };

  useEffect(() => {
    if (dbUser && dbUser.role === 'PERSONAL') {
      fetchDashboardData();
    }
  }, [dbUser]);

  const path = window.location.pathname;
  if (path.startsWith('/p/')) {
    const trainerSlug = path.split('/')[2];
    return <PublicTrainerProfileView username={trainerSlug} />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Carregando...</div>;
  }

  if (!user) {
    return <SaaSMarketingView onLogin={signIn} />;
  }

  if (user && !dbUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Complete seu cadastro</h2>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <button
              onClick={async () => {
                try {
                  setRegistering(true);
                  setError('');
                  await registerPersonal(name, phone);
                } catch (e: any) {
                  setError(e.message || 'Erro ao registrar');
                } finally {
                  setRegistering(false);
                }
              }}
              disabled={registering || !name}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-colors mt-2"
            >
              {registering ? 'Salvando...' : 'Criar Conta de Personal'}
            </button>
          </div>
          <button onClick={signOut} className="mt-6 text-sm text-slate-500 hover:text-slate-700 text-center w-full">
            Cancelar e sair
          </button>
        </div>
      </div>
    );
  }

  if (dbUser?.role === 'ALUNO') {
    return <StudentDashboardView />;
  }
  
  if (simulatedStudent) {
    return <StudentDashboardView simulatedStudent={simulatedStudent} onClosePreview={() => setSimulatedStudent(null)} />;
  }

  const renderContent = () => {
    if (activeView === 'calendar') {
      return <CalendarView />;
    }
    
    if (activeView === 'exercises') {
      return <ExercisesView />;
    }

    if (activeView === 'workouts') {
      return <WorkoutsView />;
    }

    if (activeView === 'student_workouts') {
      return <WorkoutsView student={studentForWorkouts} onBack={() => { setStudentForWorkouts(null); setActiveView('students'); }} />;
    }

    if (activeView === 'students') {
      return <StudentsView 
        onPreviewStudent={setSimulatedStudent}
        onViewWorkouts={(student) => { setStudentForWorkouts(student); setActiveView('student_workouts'); }} 
      />;
    }

    if (activeView === 'settings') {
      return <SettingsView />;
    }

    if (activeView === 'todays_sessions') {
      return <TodaysSessionsView 
        onViewWorkouts={(student) => { setStudentForWorkouts(student); setActiveView('student_workouts'); }} 
      />;
    }

    if (activeView === 'pricing') {
      return <PricingView />;
    }

    return (
      <div className="flex flex-col lg:flex-row gap-6 md:gap-10 flex-1 overflow-hidden min-h-[500px]">
        <section className="flex-[2] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 p-5 md:p-6 h-full overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agenda do Dia</h2>
            <button onClick={() => setActiveView('calendar')} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">Ver agenda completa</button>
          </div>
          
          <div className="relative mb-4 shrink-0">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aluno por nome..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {dashboardData.students.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Calendar className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                <p>Nenhuma sessão agendada para hoje.</p>
              </div>
            ) : (
              dashboardData.students.map(student => {
                const studentWorkout = dashboardData.workouts.find(w => w.studentId === student.id);
                return (
                  <div 
                    key={student.id} 
                    className="p-4 border border-slate-100 dark:border-blue-500/50 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => {
                          if (studentWorkout) {
                            setSelectedDashboardWorkout(studentWorkout);
                          }
                        }}>
                          {student.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {studentWorkout ? `Treino: ${studentWorkout.name}` : 'Sem treino programado'}
                        </p>
                      </div>
                    </div>
                    {studentWorkout && (
                      <button 
                        onClick={() => setSelectedDashboardWorkout(studentWorkout)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Ver Treino
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
          <div className="bg-slate-900 text-white p-5 md:p-6 rounded-3xl shrink-0">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400" /> Alertas Críticos
            </h3>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-400">Tudo tranquilo por enquanto.</p>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-blue-500/50 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col overflow-hidden">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 shrink-0">Ações Rápidas</h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <button 
                onClick={() => setIsAddStudentOpen(true)}
                className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-bold rounded-xl border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                Cadastrar Novo Aluno
              </button>
              <button 
                onClick={() => setIsCreateWorkoutOpen(true)}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Criar Novo Treino
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  // Dashboard Switcher
  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <nav className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-8 border-r border-slate-800 shrink-0">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">P</div>
        <div className="flex flex-col gap-6 text-slate-400">
          <div onClick={() => setActiveView('dashboard')} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:text-white'}`}>
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div onClick={() => setActiveView('students')} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'students' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:text-white'}`}>
            <Users className="w-6 h-6" />
          </div>
          <div onClick={() => setActiveView('calendar')} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'calendar' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:text-white'}`}>
            <Calendar className="w-6 h-6" />
          </div>
          <div onClick={() => setActiveView('workouts')} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'workouts' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:text-white'}`}>
            <Activity className="w-6 h-6" />
          </div>
          <div onClick={() => setActiveView('exercises')} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'exercises' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:text-white'}`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div onClick={() => setActiveView('pricing')} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'pricing' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:text-white'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div onClick={() => setActiveView('settings')} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'settings' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:text-white'}`}>
            <Settings className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <div className="p-2 text-slate-500 hover:text-white cursor-pointer transition-colors" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </div>
          <div className="p-2 text-slate-500 hover:text-white cursor-pointer transition-colors" onClick={signOut}>
            <LogOut className="w-6 h-6" />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden overflow-y-auto dark:bg-slate-900 dark:text-white transition-colors">
        <header className="flex justify-between items-end mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bom dia, {dbUser.name.split(' ')[0]}!</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Bem-vindo ao seu painel de controle</p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-950"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg rounded-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                      {notifications.filter(n => !n.read).length} novas
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 ${notif.read ? 'opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-900/10'}`}
                        >
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-indigo-500'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2">
                              {new Date(notif.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="flex flex-col gap-2 shrink-0 self-start">
                              {notif.type === 'NEW_BOOKING' && (
                                <button 
                                  onClick={() => confirmBooking(notif.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap"
                                >
                                  Confirmar
                                </button>
                              )}
                              <button 
                                onClick={() => markNotificationRead(notif.id)}
                                className="text-slate-500 hover:text-indigo-700 text-xs px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                title="Marcar como lido"
                              >
                                {notif.type === 'NEW_BOOKING' ? 'Dispensar' : <CheckCircle className="w-4 h-4 mx-auto" />}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <a 
              href={`/p/${dbUser.name.toLowerCase().replace(/ /g, '-')}`} 
              target="_blank" 
              className="hidden sm:flex text-sm text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              Minha Página Pública
            </a>
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-slate-900 dark:text-white">Personal Pro</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">{dbUser.role}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-indigo-500 font-bold shrink-0">
              {dbUser.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
          <div 
            onClick={() => setActiveView('students')}
            className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Alunos Ativos</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-bold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{studentsCount}</span>
              <span className="text-slate-400 text-sm mb-1">Total</span>
            </div>
          </div>
          <div 
            onClick={() => setActiveView('todays_sessions')}
            className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Sessões Hoje</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-bold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {dashboardData.appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
              </span>
              <span className="text-slate-400 text-sm mb-1">Agendadas</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Faturamento</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-bold dark:text-white">R$ 0</span>
              <span className="text-slate-400 text-sm mb-1">Este mês</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Taxa de Frequência</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-bold dark:text-white">0%</span>
              <span className="text-slate-400 text-sm mb-1">Média</span>
            </div>
          </div>
        </section>

        {renderContent()}
      </main>

      <AddStudentModal 
        isOpen={isAddStudentOpen} 
        onClose={() => setIsAddStudentOpen(false)} 
        onSuccess={() => {
          fetchDashboardData();
          // Ideally show a toast
        }} 
      />
      <CreateWorkoutModal 
        isOpen={isCreateWorkoutOpen} 
        onClose={() => setIsCreateWorkoutOpen(false)} 
        onSuccess={() => {
          fetchDashboardData();
          // Ideally show a toast
        }} 
      />
      <ViewWorkoutModal 
        isOpen={!!selectedDashboardWorkout}
        onClose={() => setSelectedDashboardWorkout(null)}
        workout={selectedDashboardWorkout}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardRouter />
    </AuthProvider>
  );
}

