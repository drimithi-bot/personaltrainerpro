const fs = require('fs');
let code = fs.readFileSync('src/components/PublicTrainerProfileView.tsx', 'utf8');

// Import Calendar icon
code = code.replace(
  "import { Dumbbell, Instagram, MapPin, CheckCircle2, MessageCircle, Star } from 'lucide-react';",
  "import { Dumbbell, Instagram, MapPin, CheckCircle2, MessageCircle, Star, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';"
);

// Add states
const statesInjection = `
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (!profile || profile.notFound) return;
    
    const fetchSlots = async () => {
      setFetchingSlots(true);
      try {
        const res = await fetch(\`/api/p/\${username}/availability?date=\${selectedDate}\`);
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
      const res = await fetch(\`/api/p/\${username}/book\`, {
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
        throw new Error(data.error || 'Erro ao agendar consulta');
      }
      
      setBookingStatus('success');
    } catch (err: any) {
      setBookingError(err.message);
      setBookingStatus('error');
    }
  };
`;

code = code.replace(
  "const trainerName = profile?.name",
  statesInjection + "\n  const trainerName = profile?.name"
);

const bookingSection = `
        {/* Booking Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Agendar Consulta
          </h2>
          <p className="text-slate-500 mb-6">Escolha o melhor dia e horário para conversarmos sobre seus objetivos.</p>
          
          {bookingStatus === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Consulta Agendada!</h3>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Data da Consulta</label>
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
                        className={\`py-2 rounded-xl text-sm font-bold border transition-colors \${selectedTime === time ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}\`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className={\`transition-opacity duration-300 \${selectedTime ? 'opacity-100' : 'opacity-50 pointer-events-none'}\`}>
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
                      value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
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
`;

code = code.replace(
  '{/* Pricing/CTA */}',
  bookingSection + '\n        {/* Pricing/CTA */}'
);

fs.writeFileSync('src/components/PublicTrainerProfileView.tsx', code);
