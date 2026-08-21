const fs = require('fs');
let code = fs.readFileSync('src/components/PublicTrainerProfileView.tsx', 'utf8');

if (!code.includes('import { formatPhone }')) {
  code = code.replace(
    "import { DEFAULT_PLANS } from '../lib/constants.ts';",
    "import { DEFAULT_PLANS } from '../lib/constants.ts';\nimport { formatPhone } from '../lib/utils.ts';"
  );
}

code = code.replace(
  "value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}",
  "value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: formatPhone(e.target.value)})}"
);

fs.writeFileSync('src/components/PublicTrainerProfileView.tsx', code);
