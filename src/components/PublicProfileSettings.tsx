import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.tsx';
import { formatPhone } from '../lib/utils.ts';

export function PublicProfileSettings() {
  const { user } = useAuth();
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [enableBooking, setEnableBooking] = useState(true);
  const [bookingStartTime, setBookingStartTime] = useState('07:00');
  const [bookingEndTime, setBookingEndTime] = useState('20:00');
  const [bookingDays, setBookingDays] = useState<number[]>([1,2,3,4,5]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;
        const { auth } = await import('../lib/firebase.ts');
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/public-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSlug(data.slug || '');
          setBio(data.bio || '');
          setLocation(data.location || '');
          setInstagram(data.instagram || '');
          setWhatsapp(formatPhone(data.whatsapp || ''));
          setEnableBooking(data.enableBooking !== false);
          setBookingStartTime(data.bookingStartTime || '07:00');
          setBookingEndTime(data.bookingEndTime || '20:00');
          setBookingDays(data.bookingDays ? data.bookingDays.split(',').map(Number) : [1,2,3,4,5]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/public-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          slug, bio, location, instagram, whatsapp, enableBooking, bookingStartTime, bookingEndTime, bookingDays: bookingDays.join(',')
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar perfil');
      }

      setMessage({ text: 'Perfil público atualizado com sucesso!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6 text-slate-500">Carregando perfil...</div>;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Configurar Página Pública</h3>
      
      {message.text && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">URL Personalizada (Slug)</label>
          <div className="flex items-center">
            <span className="px-3 py-3 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500 text-sm">
              app.com/p/
            </span>
            <input 
              required
              type="text" 
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="seu-nome"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-r-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Biografia / Descrição</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Ex: Especialista em hipertrofia e emagrecimento..."
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Localização</label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: São Paulo, SP"
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Instagram (apenas o @)</label>
          <input 
            type="text" 
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Ex: joaosilva"
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp para Contato</label>
          <input 
            type="text" 
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Agendamento de Consultas</h4>
          
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={enableBooking} onChange={(e) => setEnableBooking(e.target.checked)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${enableBooking ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enableBooking ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Permitir agendamento na Página Pública
            </span>
          </label>
          
          {enableBooking && (
            <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Horário Inicial</label>
                <select 
                  value={bookingStartTime}
                  onChange={(e) => setBookingStartTime(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
                >
                  {Array.from({length: 24}).map((_, i) => {
                    const h = i.toString().padStart(2, '0') + ':00';
                    return <option key={h} value={h}>{h}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Horário Final</label>
                <select 
                  value={bookingEndTime}
                  onChange={(e) => setBookingEndTime(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
                >
                  {Array.from({length: 24}).map((_, i) => {
                    const h = i.toString().padStart(2, '0') + ':00';
                    return <option key={h} value={h}>{h}</option>
                  })}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dias da semana disponíveis</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 0, label: 'Dom' },
                  { id: 1, label: 'Seg' },
                  { id: 2, label: 'Ter' },
                  { id: 3, label: 'Qua' },
                  { id: 4, label: 'Qui' },
                  { id: 5, label: 'Sex' },
                  { id: 6, label: 'Sáb' }
                ].map(day => (
                  <label 
                    key={day.id}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border cursor-pointer transition-colors ${bookingDays.includes(day.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`}
                  >
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={bookingDays.includes(day.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBookingDays([...bookingDays, day.id]);
                        } else {
                          setBookingDays(bookingDays.filter(d => d !== day.id));
                        }
                      }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>

          </>)}
        </div>

      </div>
      
      <div className="mt-2 flex justify-end">
         <button 
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-70"
         >
           {loading ? 'Salvando...' : 'Salvar Alterações'}
         </button>
      </div>
    </form>
  );
}
