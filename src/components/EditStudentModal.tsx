import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_PLANS } from '../lib/constants.ts';
import { formatPhone } from '../lib/utils.ts';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: any;
}

export function EditStudentModal({ isOpen, onClose, onSuccess, student }: EditStudentModalProps) {
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  useEffect(() => {
    if (isOpen) {
      import('../lib/firebase.ts').then(({ auth }) => {
        auth.currentUser?.getIdToken().then(token => {
          fetch('/api/schedules', { headers: { Authorization: `Bearer ${token}` }}).then(res => res.json()).then(data => setAllSchedules(data)).catch(console.error);
          fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` }})
            .then(res => res.json())
            .then(data => { if (data.length > 0) setPlans(data); })
            .catch(console.error);
        });
      });
    }
  }, [isOpen]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [planId, setPlanId] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setEmail(student.email || '');
      setPhone(formatPhone(student.phone || ''));
      setPlanId(student.planId ? String(student.planId) : '');
      setPaymentDueDate(student.paymentDueDate || '');
      if (student.schedules) setSchedules(student.schedules);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();

            const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, phone, planId: planId ? parseInt(planId) : null, paymentDueDate, schedules })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao atualizar aluno');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Aluno</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nome completo *</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">E-mail *</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Plano de Treino</label>
            <select 
              value={planId}
              onChange={e => setPlanId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-slate-700"
            >
              <option value="">Sem plano</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.frequency} - {plan.price}</option>
              ))}
            </select>
          </div>

          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Vencimento do Plano</label>
            <input 
              type="date" 
              value={paymentDueDate}
              onChange={e => setPaymentDueDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div className="border-t border-slate-100 pt-4 mt-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Horários de Treino</label>
            <div className="flex flex-col gap-3 mb-3">
              {schedules.map((schedule, index) => {
                const day = [
                  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
                ][schedule.dayOfWeek];
                return (
                  <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-slate-700">{day} - {schedule.startTime} às {schedule.endTime}</span>
                    <button type="button" onClick={() => setSchedules(schedules.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <select id="newDay" className="border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none">
                <option value="1">Segunda</option>
                <option value="2">Terça</option>
                <option value="3">Quarta</option>
                <option value="4">Quinta</option>
                <option value="5">Sexta</option>
                <option value="6">Sábado</option>
                <option value="0">Domingo</option>
              </select>
              <input type="time" id="newStart" className="border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none" defaultValue="08:00" />
              <input type="time" id="newEnd" className="border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none" defaultValue="09:00" />
            </div>
            <button 
              type="button" 
              onClick={() => {
                const dayOfWeek = parseInt((document.getElementById('newDay') as HTMLSelectElement).value);
                const startTime = (document.getElementById('newStart') as HTMLInputElement).value;
                const endTime = (document.getElementById('newEnd') as HTMLInputElement).value;
                
                // Validate overlap with other students
                const isOverlapping = allSchedules.some(s => {
                  if (student && s.studentId === student.id) return false;
                  if (s.dayOfWeek !== dayOfWeek) return false;
                  return (startTime < s.endTime && endTime > s.startTime);
                });
                
                if (isOverlapping) {
                  setError('Este horário entra em conflito com o agendamento de outro aluno.');
                  return;
                }
                
                // Validate overlap with current student's selected schedules
                const selfOverlap = schedules.some(s => {
                  if (s.dayOfWeek !== dayOfWeek) return false;
                  return (startTime < s.endTime && endTime > s.startTime);
                });
                
                if (selfOverlap) {
                  setError('Você já adicionou um horário conflitante para este aluno.');
                  return;
                }
                
                setError('');
                setSchedules([...schedules, { dayOfWeek, startTime, endTime }]);
              }}
              className="mt-2 w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors"
            >
              Adicionar Horário
            </button>
          </div>
  
          <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
