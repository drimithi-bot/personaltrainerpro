const fs = require('fs');
let code = fs.readFileSync('src/components/PublicProfileSettings.tsx', 'utf8');

// The file currently has:
//          {enableBooking && (
//            <>
//            <div className="grid grid-cols-2 gap-4">
// ...
//            <div className="mt-4">
// ...
//            </div>
//          )}
//        </div>

// Let's just fix it perfectly using regex or string replacement
code = code.replace("{enableBooking && (\n            <>\n            <div className=\"grid grid-cols-2 gap-4\">", "{enableBooking && (\n            <>\n            <div className=\"grid grid-cols-2 gap-4\">");

// Look for where to put `</>`
code = code.replace("            </div>\n          )}\n        </div>", "            </div>\n          </>)}\n        </div>");

fs.writeFileSync('src/components/PublicProfileSettings.tsx', code);
