import React from 'react';
import { Dumbbell, ArrowRight, Zap, Users, Smartphone, CheckCircle2 } from 'lucide-react';

export function SaaSMarketingView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 py-4 px-6 fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            <Dumbbell className="w-6 h-6" />
            PERSONAL PRO
          </div>
          <button 
            onClick={onLogin}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Entrar no Sistema
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            A plataforma definitiva para Personal Trainers
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-slate-900">
            Escale sua consultoria e atraia <span className="text-indigo-600">mais alunos</span>.
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
            O Personal Pro é o aplicativo completo para você prescrever treinos, acompanhar a evolução dos alunos e ter uma página pública profissional para vender seus planos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button onClick={onLogin} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-200">
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </button>
            <a href="/p/demo" className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg">
              Ver Exemplo de Página
            </a>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa em um só lugar</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Esqueça as planilhas complexas e o WhatsApp bagunçado. Profissionalize seu atendimento.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">App do Aluno</h3>
              <p className="text-slate-500 leading-relaxed">
                Seus alunos acessam os treinos por um aplicativo moderno, com vídeos de execução e registro de cargas.
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Prescrição Ágil</h3>
              <p className="text-slate-500 leading-relaxed">
                Monte treinos em minutos com nossa biblioteca de exercícios pré-cadastrada. Reutilize treinos facilmente.
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Página de Vendas</h3>
              <p className="text-slate-500 leading-relaxed">
                Tenha um link exclusivo (ex: personalpro.com/p/seu-nome) para colocar no Instagram e captar novos clientes 24h por dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-slate-900 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para subir o nível da sua consultoria?</h2>
          <p className="text-lg text-slate-400 mb-10">Junte-se a centenas de personal trainers que estão faturando mais trabalhando de forma inteligente.</p>
          <button onClick={onLogin} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-colors inline-flex items-center justify-center gap-2 text-lg">
            Começar Agora (Grátis)
          </button>
        </div>
      </section>
    </div>
  );
}
