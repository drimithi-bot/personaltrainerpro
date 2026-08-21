const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const studentId = parseInt(req.params.id);',
  'const studentId = parseInt(req.params.id);\n      if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });'
);
code = code.replace(
  'const studentId = parseInt(req.params.id);',
  'const studentId = parseInt(req.params.id);\n      if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });'
);

fs.writeFileSync('server.ts', code);
