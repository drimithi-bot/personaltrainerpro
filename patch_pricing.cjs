const fs = require('fs');
let code = fs.readFileSync('src/components/PricingView.tsx', 'utf8');

code = code.replace(
  "import { DEFAULT_PLANS } from '../lib/constants.ts';",
  "import { DEFAULT_PLANS } from '../lib/constants.ts';\nimport { useAuth } from './AuthProvider.tsx';"
);

code = code.replace(
  "export function PricingView() {",
  `export function PricingView() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);`
);

const fetchCode = `
  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        if (!user) return;
        const { auth } = await import('../lib/firebase.ts');
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/plans', {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setPlans(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [user]);
`;

code = code.replace(
  "const handleSavePlan = (updatedPlan: any) => {",
  fetchCode + "\n  const handleSavePlan = async (updatedPlan: any) => {"
);

const saveLogic = `
    const newPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(newPlans);
    
    try {
      const { auth } = await import('../lib/firebase.ts');
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/plans', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({ plans: newPlans })
      });
    } catch (err) {
      console.error('Failed to save plans to server', err);
    }
`;

code = code.replace(
  `    setPlans(current => current.map(p => 
      p.id === updatedPlan.id ? updatedPlan : p
    ));`,
  saveLogic
);

fs.writeFileSync('src/components/PricingView.tsx', code);
