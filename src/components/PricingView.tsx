import React, { useState } from 'react';
import { DollarSign, Check, Edit2 } from 'lucide-react';
import { EditPlanModal } from './EditPlanModal.tsx';
import { DEFAULT_PLANS } from '../lib/constants.ts';
import { useAuth } from './AuthProvider.tsx';

export function PricingView() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [plans, setPlans] = useState(DEFAULT_PLANS);

  const [editingPlan, setEditingPlan] = useState<any>(null);

  
  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        if (!user) return;
        const { auth } = await import('../lib/firebase.ts');
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/plans', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setPlans(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [user]);

  const handleSavePlan = async (updatedPlan: any) => {

    const newPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(newPlans);
    
    try {
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/plans', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plans: newPlans })
      });
    } catch (err) {
      console.error('Failed to save plans to server', err);
    }

  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tabela de Valores</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os valores dos seus planos de treino mensal</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 transition-all hover:-translate-y-1 flex flex-col ${plan.popular ? 'border-indigo-500 shadow-md' : 'border-slate-100 hover:border-indigo-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Mais Popular
                </div>
              )}
              
              <div className="text-center mb-2 mt-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.frequency}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-6 line-clamp-2">{plan.description}</p>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">/mês</span>
              </div>
              
              <ul className="flex flex-col gap-1.5 mb-3 text-[11px] md:text-xs text-slate-600 flex-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Treinos personalizados</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Acompanhamento no app</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Suporte via WhatsApp</span>
                </li>
              </ul>
              
              <button 
                onClick={() => setEditingPlan(plan)}
                className={`w-full py-1.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-auto ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <EditPlanModal 
        isOpen={!!editingPlan} 
        onClose={() => setEditingPlan(null)} 
        plan={editingPlan} 
        onSave={handleSavePlan} 
      />
    </div>
  );
}
