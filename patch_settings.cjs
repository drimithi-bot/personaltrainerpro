const fs = require('fs');
let code = fs.readFileSync('src/components/PublicProfileSettings.tsx', 'utf8');

// Add state variables
code = code.replace(
  "const [whatsapp, setWhatsapp] = useState('');",
  "const [whatsapp, setWhatsapp] = useState('');\n  const [enableBooking, setEnableBooking] = useState(true);\n  const [bookingStartTime, setBookingStartTime] = useState('07:00');\n  const [bookingEndTime, setBookingEndTime] = useState('20:00');"
);

// Fetch profile parsing
code = code.replace(
  "setWhatsapp(formatPhone(data.whatsapp || ''));",
  "setWhatsapp(formatPhone(data.whatsapp || ''));\n          setEnableBooking(data.enableBooking !== false);\n          setBookingStartTime(data.bookingStartTime || '07:00');\n          setBookingEndTime(data.bookingEndTime || '20:00');"
);

// Save body
code = code.replace(
  "slug, bio, location, instagram, whatsapp",
  "slug, bio, location, instagram, whatsapp, enableBooking, bookingStartTime, bookingEndTime"
);

// UI inputs for settings
const bookingSettingsUI = `
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Agendamento de Consultas</h4>
          
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={enableBooking} onChange={(e) => setEnableBooking(e.target.checked)} />
              <div className={\`block w-10 h-6 rounded-full transition-colors \${enableBooking ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}\`}></div>
              <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${enableBooking ? 'translate-x-4' : ''}\`}></div>
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Permitir agendamento na Página Pública
            </span>
          </label>
          
          {enableBooking && (
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
          )}
        </div>
`;

code = code.replace(
  "      </div>\n      \n      <div className=\"mt-2 flex justify-end\">",
  bookingSettingsUI + "\n      </div>\n      \n      <div className=\"mt-2 flex justify-end\">"
);

fs.writeFileSync('src/components/PublicProfileSettings.tsx', code);
