const fs = require('fs');
let code = fs.readFileSync('src/components/PublicProfileSettings.tsx', 'utf8');

code = code.replace(
  "const [bookingEndTime, setBookingEndTime] = useState('20:00');",
  "const [bookingEndTime, setBookingEndTime] = useState('20:00');\n  const [bookingDays, setBookingDays] = useState<number[]>([1,2,3,4,5]);"
);

code = code.replace(
  "setBookingEndTime(data.bookingEndTime || '20:00');",
  "setBookingEndTime(data.bookingEndTime || '20:00');\n          setBookingDays(data.bookingDays ? data.bookingDays.split(',').map(Number) : [1,2,3,4,5]);"
);

code = code.replace(
  "enableBooking, bookingStartTime, bookingEndTime",
  "enableBooking, bookingStartTime, bookingEndTime, bookingDays: bookingDays.join(',')"
);

const daysUI = `
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
                    className={\`px-4 py-2 rounded-xl text-sm font-bold border cursor-pointer transition-colors \${bookingDays.includes(day.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}\`}
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
`;

code = code.replace(
  "              </div>\n            </div>\n          )}\n        </div>",
  "              </div>\n            </div>\n" + daysUI + "\n          )}\n        </div>"
);

fs.writeFileSync('src/components/PublicProfileSettings.tsx', code);
