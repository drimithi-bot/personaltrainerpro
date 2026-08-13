import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  onSave: (updatedPlan: any) => void;
}

export function EditPlanModal({ isOpen, onClose, plan, onSave }: EditPlanModalProps) {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [popular, setPopular] = useState(false);

  useEffect(() => {
    if (plan) {
      setPrice(plan.price);
      setDescription(plan.description);
      setPopular(plan.popular);
    }
  }, [plan, isOpen]);

  if (!isOpen || !plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...plan,
      price,
      description,
      popular
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Plano: {plan.frequency}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Preço *</label>
            <input 
              required
              type="text" 
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Ex: R$ 150,00"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Descrição curta do plano"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={popular}
              onChange={e => setPopular(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-bold text-slate-700">Destacar como Mais Popular</span>
          </label>

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
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
