const fs = require('fs');

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  'import { users, tenants, studentProfiles } from "./src/db/schema.ts";',
  'import { users, tenants, studentProfiles, publicProfiles } from "./src/db/schema.ts";'
);
fs.writeFileSync('server.ts', serverCode);

// Fix PublicProfileSettings.tsx
let profileSettingsCode = fs.readFileSync('src/components/PublicProfileSettings.tsx', 'utf8');

if (!profileSettingsCode.includes("formatPhone")) {
  profileSettingsCode = profileSettingsCode.replace(
    "import { useAuth } from './AuthProvider.tsx';",
    "import { useAuth } from './AuthProvider.tsx';\nimport { formatPhone } from '../lib/utils.ts';"
  );
}

profileSettingsCode = profileSettingsCode.replace(
  "setWhatsapp(data.whatsapp || '');",
  "setWhatsapp(formatPhone(data.whatsapp || ''));"
);

profileSettingsCode = profileSettingsCode.replace(
  "onChange={(e) => setWhatsapp(e.target.value)}",
  "onChange={(e) => setWhatsapp(formatPhone(e.target.value))}"
);

profileSettingsCode = profileSettingsCode.replace(
  'placeholder="Ex: 11999999999"',
  'placeholder="(00) 00000-0000"'
);

fs.writeFileSync('src/components/PublicProfileSettings.tsx', profileSettingsCode);
