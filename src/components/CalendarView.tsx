import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Calendar as CalendarIcon, Clock, User, Plus, X, Trash2, AlertCircle } from 'lucide-react';

export function CalendarView() {
  const { user, dbUser } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Form state
  const [studentId, setStudentId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      if (!user) return;
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const [resApps, resStudents] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resApps.ok && resStudents.ok) {
        setAppointments(await resApps.json());
        setStudents(await resStudents.json());
      }
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !selectedDate || !startTime || !endTime) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    
    if (startTime >= endTime) {
      setError('O horário de término deve ser após o horário de início.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: parseInt(studentId),
          date: selectedDate,
          startTime,
          endTime,
          notes
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao agendar');
      }
      
      setIsModalOpen(false);
      setStudentId('');
      setStartTime('');
      setEndTime('');
      setNotes('');
      fetchData();
      
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteAppointment = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    try {
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Failed to delete appointment', e);
    }
  };

  const getStudentName = (id: number) => {
    const student = students.find(s => s.id === id);
    return student ? student.name : 'Aluno desconhecido';
  };

  const todaysAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-500" />
            Agenda Completa
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os horários dos seus alunos</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none flex-1 md:flex-none"
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-5 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500">Carregando...</div>
        ) : todaysAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-4">
            <Clock className="w-16 h-16 text-slate-200 dark:text-slate-700" />
            <p className="text-center">Nenhum agendamento para este dia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysAppointments.map(app => (
              <div key={app.id} className="border border-slate-200 dark:border-slate-700 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-lg shrink-0">
                    {getStudentName(app.studentId).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{getStudentName(app.studentId)}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4" /> {app.startTime} - {app.endTime}
                    </p>
                  </div>
                </div>
                
                {app.notes && (
                  <div className="flex-1 md:mx-8 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 w-full md:w-auto">
                    {app.notes}
                  </div>
                )}
                
                <button 
                  onClick={() => handleDeleteAppointment(app.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors w-full md:w-auto text-center"
                  title="Cancelar Agendamento"
                >
                  <Trash2 className="w-5 h-5 mx-auto" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Novo Agendamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Aluno</label>
                <select 
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Selecione um aluno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Data</label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Início</label>
                  <input 
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Término</label>
                  <input 
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Observações (opcional)</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Focar em mobilidade hoje"
                ></textarea>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  {submitting ? 'Salvando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
