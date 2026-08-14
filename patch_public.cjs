const fs = require('fs');
let code = fs.readFileSync('src/components/PublicTrainerProfileView.tsx', 'utf8');

const bookingSectionStart = `{/* Booking Section */}`;
const bookingSectionReplacement = `{profile?.enableBooking !== false && (
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Agendar Consulta
          </h2>`;

// First replace the start
code = code.replace(
  `{/* Booking Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Agendar Consulta
          </h2>`,
  `{/* Booking Section */}
        ${bookingSectionReplacement}`
);

// Then find the end of the booking section. Let's see what is after the booking section.
// Usually `        {/* Pricing/CTA */}`
const bookingSectionEnd = `        {/* Pricing/CTA */}`;

code = code.replace(
  `        {/* Pricing/CTA */}`,
  `      )}
        {/* Pricing/CTA */}`
);

fs.writeFileSync('src/components/PublicTrainerProfileView.tsx', code);
