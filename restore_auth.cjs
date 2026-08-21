const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'app.delete("/api/students/:id", async (req: any, res) => {\n    // Mock user\n    req.dbUser = { id: 1, role: "PERSONAL", tenantId: 1 };',
  'app.delete("/api/students/:id", requireAuth, async (req: AuthRequest, res) => {'
);

fs.writeFileSync('server.ts', code);
