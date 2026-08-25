import React, { useEffect, useState } from 'react';
import { Dumbbell, Instagram, MapPin, CheckCircle2, MessageCircle, Star, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { DEFAULT_PLANS } from '../lib/constants.ts';
import { formatPhone } from '../lib/utils.ts';

export function PublicTrainerProfileView({ username }: { username: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/p/${username}`);
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

  
  const [selectedDate, setSelectedDate] = useState('');

  // When profile loads, set a sensible default date
  useEffect(() => {
    if (profile && !profile.notFound && !selectedDate) {
      const allowedDays = (profile.bookingDays || '1,2,3,4,5').split(',').map(Number);
      let date = new Date();
      date.setDate(date.getDate() + 1); // Start checking from tomorrow
      let maxTries = 14;
      while (!allowedDays.includes(date.getDay()) && maxTries > 0) {
        date.setDate(date.getDate() + 1);
        maxTries--;
      }
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  }, [profile, selectedDate]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (!profile || profile.notFound) return;
    
    const fetchSlots = async () => {
      if (!selectedDate) return;
      setFetchingSlots(true);
      try {
        const res = await fetch(`/api/p/${username}/availability?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingSlots(false);
      }
    };
    
    fetchSlots();
    setSelectedTime(''); // Reset selected time when date changes
    setBookingStatus('idle');
  }, [selectedDate, username, profile]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('loading');
    
    try {
      const res = await fetch(`/api/p/${username}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          ...bookingForm
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao agendar avaliação');
      }
      
      setBookingStatus('success');
    } catch (err: any) {
      setBookingError(err.message);
      setBookingStatus('error');
    }
  };

  const trainerName = profile?.name || (username.charAt(0).toUpperCase() + username.slice(1).replace('-', ' '));

  useEffect(() => {
    if (trainerName) document.title = `Consultoria com ${trainerName} | Personal Pro`;
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
      const number = profile.whatsapp.replace(/\D/g, '');
      const text = encodeURIComponent(`Olá ${trainerName}! Gostaria de saber mais sobre a consultoria.`);
      window.open(`https://wa.me/${number}?text=${text}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <header className="bg-slate-900 text-white relative overflow-hidden">
        {profile?.heroImageUrl && profile?.heroImagePosition === 'background' && (
           <div className="absolute inset-0 z-0">
             <img src={profile.heroImageUrl} className="w-full h-full object-cover opacity-30" alt="Background" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
           </div>
        )}
        {(!profile?.heroImageUrl || profile?.heroImagePosition !== 'background') && (
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent z-0"></div>
        )}
        
        <div className={`max-w-6xl mx-auto relative z-10 px-6 pt-20 pb-32 flex flex-col md:flex-row ${profile?.heroImagePosition === 'left' ? 'md:flex-row-reverse' : ''} items-center justify-center gap-12`}>
          <div className={`flex flex-col items-center text-center ${profile?.heroImageUrl && (profile?.heroImagePosition === 'left' || profile?.heroImagePosition === 'right') ? 'md:items-start md:text-left flex-1' : 'max-w-4xl w-full'}`}>
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
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
              {profile?.bio || "Especialista em hipertrofia e emagrecimento. Transforme seu corpo e sua saúde com uma metodologia comprovada e acompanhamento de perto."}
            </p>
            
            <div className={`flex flex-wrap gap-4 text-sm font-medium ${profile?.heroImageUrl && (profile?.heroImagePosition === 'left' || profile?.heroImagePosition === 'right') ? 'justify-center md:justify-start' : 'justify-center'}`}>
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
          
          {profile?.heroImageUrl && (profile?.heroImagePosition === 'left' || profile?.heroImagePosition === 'right') && (
            <div className="flex-1 w-full max-w-md hidden md:block">
              <img src={profile.heroImageUrl} className="w-full h-auto rounded-3xl shadow-2xl object-cover aspect-[4/5] border border-slate-700/50 bg-slate-800" alt="Trainer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
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

        
        {/* Booking Section */}
        {profile?.enableBooking !== false && (
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Agendar Avaliação
          </h2>
          <p className="text-slate-500 mb-6">Escolha o melhor dia e horário para conversarmos sobre seus objetivos.</p>
          
          {bookingStatus === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Avaliação Agendada!</h3>
              <p className="text-slate-600">Em breve entrarei em contato pelo WhatsApp ou E-mail para confirmarmos. Até lá!</p>
              <button 
                onClick={() => {
                  setBookingStatus('idle');
                  setSelectedTime('');
                  setBookingForm({ name: '', email: '', phone: '', notes: '' });
                }}
                className="mt-6 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
              >
                Fazer outro agendamento
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Date & Time Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data da Avaliação</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                
                <label className="block text-sm font-bold text-slate-700 mb-2">Horários Disponíveis</label>
                {fetchingSlots ? (
                  <div className="text-slate-500 text-sm">Buscando horários...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-sm border border-slate-200 text-center">
                    Nenhum horário disponível para esta data.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-xl text-sm font-bold border transition-colors ${selectedTime === time ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className={`transition-opacity duration-300 ${selectedTime ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <form onSubmit={handleBook} className="flex flex-col gap-4">
                  {bookingStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{bookingError}</div>
                  )}
                  
                  <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Horário selecionado:</div>
                    <div className="font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {selectedTime || '--:--'}
                    </div>
                  </div>

                  <div>
                    <input 
                      required type="text" placeholder="Seu nome completo"
                      value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      required type="email" placeholder="E-mail"
                      value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <input 
                      type="tel" placeholder="WhatsApp"
                      value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: formatPhone(e.target.value)})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Qual o seu objetivo principal?"
                      value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={bookingStatus === 'loading' || !selectedTime}
                    className="w-full py-3 mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                  >
                    {bookingStatus === 'loading' ? 'Agendando...' : 'Confirmar Agendamento'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

      )}
        {/* Pricing/CTA */}
        <h2 className="text-2xl font-bold mb-6 text-center">Planos de Treinos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 w-full max-w-7xl mx-auto">
          { (profile?.plans && profile.plans.length > 0 ? profile.plans : DEFAULT_PLANS).map((plan: any) => (
            <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 flex flex-col ${plan.popular ? 'border-indigo-500 shadow-md' : 'border-slate-100 dark:border-slate-800'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                  Mais Popular
                </div>
              )}
              
              <div className="text-center mb-4 mt-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.frequency}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 h-10 line-clamp-2">{plan.description}</p>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm">/mês</span>
              </div>
              
              <button 
                onClick={handleWhatsapp}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-auto ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'}`}
              >
                <MessageCircle className="w-4 h-4" />
                Assinar
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
