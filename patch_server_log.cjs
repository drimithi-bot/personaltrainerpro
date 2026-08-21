const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'console.error("FULL ERROR", error); res.status(500).json({ error: error.message, stack: error.stack });',
  'require("fs").appendFileSync("server_error.log", error.stack + "\\n"); console.error("FULL ERROR", error); res.status(500).json({ error: error.message, stack: error.stack });'
);

fs.writeFileSync('server.ts', code);
