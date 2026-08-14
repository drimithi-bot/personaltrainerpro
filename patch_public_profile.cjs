const fs = require('fs');
let code = fs.readFileSync('src/components/PublicTrainerProfileView.tsx', 'utf8');

const newProfile = `import React, { useEffect, useState } from 'react';
import { Dumbbell, Instagram, MapPin, CheckCircle2, MessageCircle, Star } from 'lucide-react';
import { DEFAULT_PLANS } from '../lib/constants.ts';

export function PublicTrainerProfileView({ username }: { username: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(\`/api/p/\${username}\`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          setProfile({ notFound: true });
        }
      } catch (err) {
        console.error(err);
        setProfile({ notFound: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const trainerName = profile?.name || (username.charAt(0).toUpperCase() + username.slice(1).replace('-', ' '));

  useEffect(() => {
    if (trainerName) document.title = \`Consultoria com \${trainerName} | Personal Pro\`;
  }, [trainerName]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Carregando perfil...</div>;
  }

  if (profile?.notFound) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">Perfil não encontrado</h1>
      <p>A página que você está procurando não existe ou não foi configurada.</p>
    </div>;
  }

  const handleWhatsapp = () => {
    if (profile?.whatsapp) {
      const number = profile.whatsapp.replace(/\\D/g, '');
      const text = encodeURIComponent(\`Olá \${trainerName}! Gostaria de saber mais sobre a consultoria.\`);
      window.open(\`https://wa.me/\${number}?text=\${text}\`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <header className="bg-slate-900 text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-4xl font-bold mb-6 border-4 border-slate-800 shadow-xl overflow-hidden">
            {profile?.photoUrl ? (
               <img src={profile.photoUrl} alt={trainerName} className="w-full h-full object-cover" />
            ) : (
               trainerName.charAt(0)
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Treine com <span className="text-indigo-400">{trainerName}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-8 leading-relaxed">
            {profile?.bio || "Especialista em hipertrofia e emagrecimento. Transforme seu corpo e sua saúde com uma metodologia comprovada e acompanhamento de perto."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            {(profile?.location || "São Paulo, SP") && (
              <span className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {profile?.location || "São Paulo, SP"}
              </span>
            )}
            {profile?.instagram && (
              <span className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
                <Instagram className="w-4 h-4 text-pink-400" />
                @{profile.instagram}
              </span>
            )}
            <span className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-full border border-slate-700">
              <Star className="w-4 h-4 text-amber-400" />
              5.0 Avaliações
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
          <div className="grid sm:grid-cols-2 gap-6 text-slate-600">
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Treino 100% Individualizado</h4>
                <p className="text-sm">Planilhas montadas de acordo com seu objetivo, rotina e limitações.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 mb-1">App Exclusivo</h4>
                <p className="text-sm">Acesso a todos os treinos com vídeos demonstrativos na palma da mão.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Suporte Direto</h4>
                <p className="text-sm">Tire dúvidas sobre execução e carga diretamente comigo.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Avaliação Constante</h4>
                <p className="text-sm">Ajustes frequentes para garantir que você não estagne nos resultados.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing/CTA */}
        <h2 className="text-2xl font-bold mb-6 text-center">Planos de Consultoria</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {DEFAULT_PLANS.slice(0, 2).map((plan, i) => (
            <div key={i} className={\`bg-white rounded-3xl p-8 shadow-sm border \${i === 1 ? 'border-indigo-500 relative' : 'border-slate-100'}\`}>
              {i === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Mais Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.frequency}</h3>
              <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
              </div>
              <button 
                onClick={handleWhatsapp}
                className={\`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors \${i === 1 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}\`}
              >
                <MessageCircle className="w-5 h-5" />
                Quero este plano
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} {trainerName}. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
`;

fs.writeFileSync('src/components/PublicTrainerProfileView.tsx', newProfile);
