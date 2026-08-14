import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { Clock, Plus, Trash2, AlertCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export function RecurrenceSettings() {
  const { user } = useAuth();
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dayOfWeek, setDayOfWeek] = useState(1); // Default to Monday
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchBlockedTimes = async () => {
    try {
      if (!user) return;
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch('/api/settings/blocked-times', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setBlockedTimes(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch blocked times', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedTimes();
  }, [user]);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      setError('O horário de término deve ser após o horário de início.');
      return;
    }
    if (!startTime || !endTime) {
      setError('Preencha os horários.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch('/api/settings/blocked-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dayOfWeek: parseInt(dayOfWeek.toString()),
          startTime,
          endTime,
          reason
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao criar bloqueio');
      }
      
      setStartTime('');
      setEndTime('');
      setReason('');
      fetchBlockedTimes();
      
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta regra de bloqueio?')) return;
    
    try {
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch(`/api/settings/blocked-times/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchBlockedTimes();
      }
    } catch (e) {
      console.error('Failed to delete block', e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="font-bold text-slate-900 dark:text-white">Configurações de Horário</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Defina blocos de horários recorrentes em que você não estará disponível para agendamentos.
        </p>
      </div>

      <form onSubmit={handleCreateBlock} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Novo Bloqueio Recorrente
        </h4>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Dia da Semana</label>
            <select 
              value={dayOfWeek}
              onChange={e => setDayOfWeek(parseInt(e.target.value))}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              {DAYS_OF_WEEK.map((day, idx) => (
                <option key={idx} value={idx}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Início</label>
            <input 
              type="time" 
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Fim</label>
            <input 
              type="time" 
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Motivo (Opcional)</label>
            <input 
              type="text" 
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ex: Almoço"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            disabled={submitting}
            className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Adicionar Bloqueio
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Carregando bloqueios...</p>
        ) : blockedTimes.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Nenhum bloqueio de horário configurado.
          </div>
        ) : (
          DAYS_OF_WEEK.map((day, idx) => {
            const blocks = blockedTimes.filter(b => b.dayOfWeek === idx).sort((a, b) => a.startTime.localeCompare(b.startTime));
            if (blocks.length === 0) return null;
            
            return (
              <div key={idx} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 text-sm">
                  {day}
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {blocks.map(block => (
                    <li key={block.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {block.startTime} - {block.endTime}
                        </div>
                        {block.reason && (
                          <span className="text-slate-500 dark:text-slate-400 text-sm">{block.reason}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        title="Remover regra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
