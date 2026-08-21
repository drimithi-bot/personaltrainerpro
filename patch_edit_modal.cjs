const fs = require('fs');
let code = fs.readFileSync('src/components/EditStudentModal.tsx', 'utf8');

code = code.replace(
  "const [name, setName] = useState('');",
  \`const [plans, setPlans] = React.useState<any[]>(DEFAULT_PLANS);
  React.useEffect(() => {
    if (isOpen) {
      import('../lib/firebase.ts').then(({ auth }) => {
        auth.currentUser?.getIdToken().then(token => {
          fetch('/api/plans', { headers: { Authorization: \\\`Bearer \\\${token}\\\` }})
            .then(res => res.json())
            .then(data => { if (data.length > 0) setPlans(data); })
            .catch(console.error);
        });
      });
    }
  }, [isOpen]);

  const [name, setName] = useState('');\`
);

fs.writeFileSync('src/components/EditStudentModal.tsx', code);
