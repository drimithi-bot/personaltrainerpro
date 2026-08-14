const fs = require('fs');
let code = fs.readFileSync('src/components/PublicProfileSettings.tsx', 'utf8');

code = code.replace(
  "{enableBooking && (\n            <div className=\"grid grid-cols-2 gap-4\">",
  "{enableBooking && (\n            <>\n            <div className=\"grid grid-cols-2 gap-4\">"
);

code = code.replace(
  "            </div>\n          )}\n        </div>",
  "            </div>\n            </>\n          )}\n        </div>"
);

fs.writeFileSync('src/components/PublicProfileSettings.tsx', code);
