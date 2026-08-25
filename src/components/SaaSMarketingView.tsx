import React, { useState } from 'react';
import {
  Dumbbell,
  ArrowRight,
  Zap,
  Users,
  Smartphone,
  CheckCircle2,
  CalendarDays,
  Bell,
  LineChart,
  ClipboardList,
  ChevronDown,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-600',
    title: 'App do Aluno',
    text: 'Seus alunos acessam os treinos por um aplicativo moderno, com vídeos de execução e registro de cargas.',
  },
  {
    icon: Zap,
    color: 'bg-indigo-100 text-indigo-600',
    title: 'Prescrição Ágil',
    text: 'Monte treinos em minutos com séries, repetições, carga e descanso por exercício. Reutilize treinos facilmente.',
  },
  {
    icon: Users,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Página de Vendas',
    text: 'Tenha um link exclusivo (ex: personal.drimithi.com.br/p/seu-nome) para colocar no Instagram e captar novos clientes 24h por dia.',
  },
  {
    icon: CalendarDays,
    color: 'bg-amber-100 text-amber-600',
    title: 'Agenda Inteligente',
    text: 'Gerencie horários de atendimento, bloqueios de agenda e agendamentos dos alunos sem conflitos.',
  },
  {
    icon: ClipboardList,
    color: 'bg-rose-100 text-rose-600',
    title: 'Ficha Completa do Aluno',
    text: 'Dados pessoais, objetivos, restrições, contato de emergência e histórico de evolução, tudo num só lugar.',
  },
  {
    icon: Bell,
    color: 'bg-violet-100 text-violet-600',
    title: 'Notificações',
    text: 'Fique por dentro de agendamentos, renovações de plano e pendências dos alunos sem precisar checar tudo manualmente.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Crie sua conta grátis',
    text: 'Cadastro rápido com login Google. Sem cartão de crédito.',
  },
  {
    number: '2',
    title: 'Monte seus treinos e sua agenda',
    text: 'Cadastre exercícios, monte treinos por aluno e configure seus horários de atendimento.',
  },
  {
    number: '3',
    title: 'Compartilhe sua página e venda',
    text: 'Divulgue seu link exclusivo no Instagram e WhatsApp para captar e converter novos alunos.',
  },
];

const FAQ = [
  {
    q: 'Preciso instalar algum programa?',
    a: 'Não. O Personal Pro funciona direto do navegador, no computador ou celular.',
  },
  {
    q: 'Dá para usar com quantos alunos?',
    a: 'Não há limite de alunos cadastrados no plano atual.',
  },
  {
    q: 'Meus alunos precisam pagar para acessar?',
    a: 'Não. O acesso dos alunos é incluído na sua assinatura como personal trainer.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem fidelidade ou multa.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-slate-900">{q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-500 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

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
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#funcionalidades" className="hover:text-slate-900 transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-slate-900 transition-colors">Como funciona</a>
            <a href="#preco" className="hover:text-slate-900 transition-colors">Preço</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">Dúvidas</a>
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
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
            <button onClick={onLogin} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-200">
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </button>
            <a href="/p/demo" className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg">
              Ver Exemplo de Página
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Sem fidelidade</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Cancele quando quiser</span>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="funcionalidades" className="py-24 px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa em um só lugar</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Esqueça as planilhas complexas e o WhatsApp bagunçado. Profissionalize seu atendimento.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-slate-50 border border-slate-100 rounded-3xl p-8">
                  <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6 bg-slate-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Do cadastro ao primeiro aluno pago, em três passos simples.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.number} className="relative bg-white border border-slate-100 rounded-3xl p-8">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-6 text-lg">
                  {s.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preco" className="py-24 px-6 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Um plano simples, sem pegadinha</h2>
          <p className="text-lg text-slate-500 mb-12">Alunos ilimitados. Sem taxa de instalação. Cancele quando quiser.</p>

          <div className="bg-gradient-to-b from-indigo-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl shadow-indigo-200 max-w-md mx-auto">
            <p className="text-indigo-200 font-semibold mb-2">Plano Personal Pro</p>
            <div className="flex items-end justify-center gap-1 mb-6">
              <span className="text-2xl font-bold mt-2">R$</span>
              <span className="text-6xl font-extrabold tracking-tight">47</span>
              <span className="text-indigo-200 mb-2">/mês</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {[
                'Alunos ilimitados',
                'Prescrição de treinos completa',
                'Agenda com bloqueios e sem conflitos',
                'Página pública de vendas exclusiva',
                'Notificações e gestão de planos',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-indigo-50">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onLogin}
              className="w-full px-8 py-4 bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Começar Agora <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-slate-50 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-slate-900 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para subir o nível da sua consultoria?</h2>
          <p className="text-lg text-slate-400 mb-10">Junte-se aos personal trainers que estão faturando mais trabalhando de forma inteligente.</p>
          <button onClick={onLogin} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-colors inline-flex items-center justify-center gap-2 text-lg">
            Começar Agora (Grátis)
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <Dumbbell className="w-5 h-5 text-indigo-600" />
            Personal Pro
          </div>
          <p>Um produto do ecossistema Drimithi.</p>
        </div>
      </footer>
    </div>
  );
}
