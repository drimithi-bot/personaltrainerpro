const fs = require('fs');
let code = fs.readFileSync('src/components/AddStudentModal.tsx', 'utf8');

if (!code.includes('const [plans')) {
  code = code.replace(
    "const [name, setName] = useState('');",
    "const [plans, setPlans] = React.useState<any[]>(DEFAULT_PLANS);\n  React.useEffect(() => {\n    if (isOpen) {\n      import('../lib/firebase.ts').then(({ auth }) => {\n        auth.currentUser?.getIdToken().then(token => {\n          fetch('/api/plans', { headers: { Authorization: \`Bearer \${token}\` }})\n            .then(res => res.json())\n            .then(data => { if (data.length > 0) setPlans(data); })\n            .catch(console.error);\n        });\n      });\n    }\n  }, [isOpen]);\n\n  const [name, setName] = useState('');"
  );
  code = code.replace(/DEFAULT_PLANS\.map/g, 'plans.map');
  fs.writeFileSync('src/components/AddStudentModal.tsx', code);
}

let code2 = fs.readFileSync('src/components/EditStudentModal.tsx', 'utf8');
if (!code2.includes('const [plans')) {
  code2 = code2.replace(
    "const [name, setName] = useState(student.name);",
    "const [plans, setPlans] = React.useState<any[]>(DEFAULT_PLANS);\n  React.useEffect(() => {\n    if (isOpen) {\n      import('../lib/firebase.ts').then(({ auth }) => {\n        auth.currentUser?.getIdToken().then(token => {\n          fetch('/api/plans', { headers: { Authorization: \`Bearer \${token}\` }})\n            .then(res => res.json())\n            .then(data => { if (data.length > 0) setPlans(data); })\n            .catch(console.error);\n        });\n      });\n    }\n  }, [isOpen]);\n\n  const [name, setName] = useState(student.name);"
  );
  code2 = code2.replace(/DEFAULT_PLANS\.map/g, 'plans.map');
  fs.writeFileSync('src/components/EditStudentModal.tsx', code2);
}
