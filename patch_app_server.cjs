const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');
const endpoint = `
  app.put("/api/notifications/:id/confirm", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.dbUser.tenantId;
      
      const notif = await db.select().from(notifications)
        .where(and(eq(notifications.id, parseInt(id)), eq(notifications.tenantId, tenantId)))
        .limit(1);
        
      if (notif.length > 0 && notif[0].relatedId && notif[0].type === 'NEW_BOOKING') {
        // Update appointment status
        await db.update(appointments)
          .set({ status: 'CONFIRMED' })
          .where(and(eq(appointments.id, notif[0].relatedId), eq(appointments.tenantId, tenantId)));
          
        // Mark notification as read and updated message
        await db.update(notifications)
          .set({ 
            read: true,
            message: notif[0].message + ' (Confirmado)'
          })
          .where(eq(notifications.id, parseInt(id)));
          
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Notification or appointment not found" });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
`;
serverCode = serverCode.replace(
  '  app.put("/api/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {',
  endpoint + '\n  app.put("/api/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {'
);
fs.writeFileSync('server.ts', serverCode);


let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const confirmFunction = `
  const confirmBooking = async (id: number) => {
    try {
      const { auth } = await import('./lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch(\`/api/notifications/\${id}/confirm\`, {
        method: 'PUT',
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, message: n.message + ' (Confirmado)' } : n));
        fetchDashboardData();
      }
    } catch (e) {
      console.error('Failed to confirm booking', e);
    }
  };
`;

appCode = appCode.replace(
  '  const markNotificationRead = async (id: number) => {',
  confirmFunction + '\n  const markNotificationRead = async (id: number) => {'
);

const oldUI = `                          {!notif.read && (
                            <button 
                              onClick={() => markNotificationRead(notif.id)}
                              className="text-indigo-600 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shrink-0 self-start"
                              title="Marcar como lido"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}`;

const newUI = `                          {!notif.read && (
                            <div className="flex flex-col gap-2 shrink-0 self-start">
                              {notif.type === 'NEW_BOOKING' && (
                                <button 
                                  onClick={() => confirmBooking(notif.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap"
                                >
                                  Confirmar
                                </button>
                              )}
                              <button 
                                onClick={() => markNotificationRead(notif.id)}
                                className="text-slate-500 hover:text-indigo-700 text-xs px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                title="Marcar como lido"
                              >
                                {notif.type === 'NEW_BOOKING' ? 'Dispensar' : <CheckCircle className="w-4 h-4 mx-auto" />}
                              </button>
                            </div>
                          )}`;

appCode = appCode.replace(oldUI, newUI);

fs.writeFileSync('src/App.tsx', appCode);

