import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Smartphone, Clock, Layout } from 'lucide-react';
import { PublicProfileSettings } from './PublicProfileSettings.tsx';
import { useAuth } from './AuthProvider.tsx';
import { formatPhone } from '../lib/utils.ts';
import { RecurrenceSettings } from './RecurrenceSettings.tsx';

export function SettingsView() {
  const { dbUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {
    if (dbUser?.phone) {
      setPhone(formatPhone(dbUser.phone));
    }
  }, [dbUser]);

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configurações</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ajuste suas preferências e dados do perfil</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-left transition-colors ${activeTab === 'perfil' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400'}`}
          >
            <User className="w-5 h-5" />
            Perfil
          </button>
          <button 
            onClick={() => setActiveTab('horarios')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-left transition-colors ${activeTab === 'horarios' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400'}`}
          >
            <Clock className="w-5 h-5" />
            Horários
          </button>
          
          <button 
            onClick={() => setActiveTab('public-page')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-left transition-colors ${activeTab === 'public-page' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400'}`}
          >
            <Layout className="w-5 h-5" />
            Página Pública
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-bold w-full text-left transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            Notificações
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-bold w-full text-left transition-colors">
            <Shield className="w-5 h-5 text-slate-400" />
            Segurança
          </button>
        </div>
        
        <div className="flex-1 flex flex-col gap-6 max-w-2xl">
          {activeTab === 'perfil' && (
            <>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-6">
                 <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-slate-800 shadow-sm shrink-0">
                    {dbUser?.name?.substring(0, 2).toUpperCase() || 'P'}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 dark:text-white text-lg">{dbUser?.name}</h3>
                   <p className="text-slate-500 dark:text-slate-400">{dbUser?.email}</p>
                   <span className="inline-block mt-2 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                     Plano: {dbUser?.role}
                   </span>
                 </div>
                 <button className="ml-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors">
                   Editar Foto
                 </button>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Informações Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                    <input type="text" defaultValue={dbUser?.name} className="w-full border border-slate-200 dark:border-blue-500/50 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                    <input type="email" defaultValue={dbUser?.email} disabled className="w-full border border-slate-200 dark:border-blue-500/50 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000" 
                      className="w-full border border-slate-200 dark:border-blue-500/50 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white" 
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                   <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors">
                     Salvar Alterações
                   </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'horarios' && (
            <RecurrenceSettings />
          )}

          {activeTab === 'public-page' && (
            <PublicProfileSettings />
          )}
        </div>
      </div>
    </div>
  );
}
