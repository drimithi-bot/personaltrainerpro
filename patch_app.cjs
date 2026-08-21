const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
code = code.replace(
  "import { LayoutDashboard, Users, Calendar, Activity, Settings, LogOut, Sun, Moon, BookOpen, DollarSign } from 'lucide-react';",
  "import { LayoutDashboard, Users, Calendar, Activity, Settings, LogOut, Sun, Moon, BookOpen, DollarSign, Bell, CheckCircle } from 'lucide-react';"
);

// State for notifications
const stateInjection = `  const [activeView, setActiveView] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { auth } = await import('./lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      const { auth } = await import('./lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch(\`/api/notifications/\${id}/read\`, {
        method: 'PUT',
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  useEffect(() => {
    if (dbUser?.role === 'PERSONAL') {
      fetchNotifications();
      // Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [dbUser]);
`;

code = code.replace("  const [activeView, setActiveView] = useState('dashboard');", stateInjection);

const notifUI = `            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-950"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg rounded-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                      {notifications.filter(n => !n.read).length} novas
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={\`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 \${notif.read ? 'opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-900/10'}\`}
                        >
                          <div className={\`w-2 h-2 mt-1.5 rounded-full shrink-0 \${notif.read ? 'bg-transparent' : 'bg-indigo-500'}\`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2">
                              {new Date(notif.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {!notif.read && (
                            <button 
                              onClick={() => markNotificationRead(notif.id)}
                              className="text-indigo-600 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shrink-0 self-start"
                              title="Marcar como lido"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>`;

code = code.replace(
  `          <div className="flex gap-4 items-center">
            <a`,
  `          <div className="flex gap-4 items-center">
${notifUI}
            <a`
);

fs.writeFileSync('src/App.tsx', code);
