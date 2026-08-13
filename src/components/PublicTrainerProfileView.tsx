import React, { useEffect } from 'react';
import { Dumbbell, Instagram, MapPin, CheckCircle2, MessageCircle, Star } from 'lucide-react';

export function PublicTrainerProfileView({ username }: { username: string }) {
  // Mock data for the demonstration
  const trainerName = username === 'demo' ? 'João Silva' : (username.charAt(0).toUpperCase() + username.slice(1).replace('-', ' '));
  
  useEffect(() => {
    document.title = `Consultoria com ${trainerName} | Personal Pro`;
  }, [trainerName]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <header className="bg-slate-900 text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-4xl font-bold mb-6 border-4 border-slate-800 shadow-xl">
            {trainerName.charAt(0)}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Treine com <span className="text-indigo-400">{trainerName}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-8 leading-relaxed">
            Especialista em hipertrofia e emagrecimento. Transforme seu corpo e sua saúde com uma metodologia comprovada e acompanhamento de perto.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
              <MapPin className="w-4 h-4 text-indigo-400" />
              São Paulo, SP
            </span>
            <span className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
              <Instagram className="w-4 h-4 text-pink-400" />
              @{username.toLowerCase()}
            </span>
            <span className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
              <Star className="w-4 h-4 text-amber-400" />
              5.0 (120+ alunos)
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-16 relative z-20 pb-24">
        {/* About Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-indigo-600" />
            Por que treinar comigo?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-slate-600 leading-relaxed space-y-4">
              <p>
                Sou formado em Educação Física com pós-graduação em Biomecânica. Há mais de 8 anos ajudo pessoas a conquistarem o corpo que desejam sem dietas malucas ou treinos intermináveis.
              </p>
              <p>
                Meu foco é entender a sua rotina e criar um planejamento 100% individualizado, garantindo que você tenha resultados consistentes.
              </p>
            </div>
            <div className="space-y-4">
              {[
                'Treinos 100% individualizados',
                'Avaliação postural e física completa',
                'Suporte direto via WhatsApp',
                'Ajustes mensais de acordo com evolução'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-900">Planos de Consultoria</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Consultoria Online</h3>
            <p className="text-slate-500 mb-6 h-12">Para quem já treina e precisa de um planejamento focado em resultados.</p>
            <div className="text-4xl font-bold text-slate-900 mb-6">
              R$ 149<span className="text-lg text-slate-400 font-normal">/mês</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" /> App exclusivo de treinos
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Vídeos de execução
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Dúvidas pelo WhatsApp
              </li>
            </ul>
            <a 
              href={`https://wa.me/5511999999999?text=Olá ${trainerName}, tenho interesse na Consultoria Online!`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contratar Plano
            </a>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 shadow-lg border border-indigo-500 flex flex-col transition-transform hover:-translate-y-1 duration-300 relative text-white">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Mais Vendido
            </div>
            <h3 className="text-xl font-bold mb-2">Personal Premium</h3>
            <p className="text-indigo-200 mb-6 h-12">Acompanhamento híbrido ou presencial para resultados acelerados.</p>
            <div className="text-4xl font-bold mb-6">
              R$ 399<span className="text-lg text-indigo-200 font-normal">/mês</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Tudo da consultoria online
              </li>
              <li className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 1 encontro presencial quinzenal
              </li>
              <li className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Correção de movimentos em vídeo
              </li>
              <li className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Avaliação física mensal
              </li>
            </ul>
            <a 
              href={`https://wa.me/5511999999999?text=Olá ${trainerName}, quero saber mais sobre o Personal Premium!`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-white hover:bg-slate-100 text-indigo-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          </div>

        </div>
      </main>
      
      {/* Footer Powered By */}
      <footer className="py-8 text-center text-slate-500 text-sm bg-white border-t border-slate-100">
        <p>Desenvolvido com <a href="/" className="font-bold text-indigo-600 hover:underline">Personal Pro</a></p>
      </footer>
    </div>
  );
}
