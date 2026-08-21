const fs = require('fs');

// Patch StudentsView.tsx
let studentsView = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');
studentsView = studentsView.replace(
  "const [students, setStudents] = useState<any[]>([]);",
  "const [students, setStudents] = useState<any[]>([]);\n  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);"
);
const fetchStudentsStr = `      const res = await fetch('/api/students', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }`;
const fetchPlansStr = `      const resPlans = await fetch('/api/plans', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (resPlans.ok) {
        const plansData = await resPlans.json();
        if (plansData.length > 0) setPlans(plansData);
      }`;
studentsView = studentsView.replace(fetchStudentsStr, fetchStudentsStr + '\n' + fetchPlansStr);
studentsView = studentsView.replace(/DEFAULT_PLANS\.find/g, 'plans.find');
fs.writeFileSync('src/components/StudentsView.tsx', studentsView);

// Patch AddStudentModal.tsx
let addStudent = fs.readFileSync('src/components/AddStudentModal.tsx', 'utf8');
addStudent = addStudent.replace(
  "const [formData, setFormData] = useState({",
  "const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);\n  useEffect(() => {\n    if (isOpen) {\n      import('../lib/firebase.ts').then(({ auth }) => {\n        auth.currentUser?.getIdToken().then(token => {\n          fetch('/api/plans', { headers: { Authorization: \`Bearer \${token}\` }})\n            .then(res => res.json())\n            .then(data => { if (data.length > 0) setPlans(data); })\n            .catch(console.error);\n        });\n      });\n    }\n  }, [isOpen]);\n\n  const [formData, setFormData] = useState({"
);
addStudent = addStudent.replace(/DEFAULT_PLANS\.map/g, 'plans.map');
fs.writeFileSync('src/components/AddStudentModal.tsx', addStudent);

// Patch EditStudentModal.tsx
let editStudent = fs.readFileSync('src/components/EditStudentModal.tsx', 'utf8');
editStudent = editStudent.replace(
  "const [formData, setFormData] = useState({",
  "const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);\n  useEffect(() => {\n    if (isOpen) {\n      import('../lib/firebase.ts').then(({ auth }) => {\n        auth.currentUser?.getIdToken().then(token => {\n          fetch('/api/plans', { headers: { Authorization: \`Bearer \${token}\` }})\n            .then(res => res.json())\n            .then(data => { if (data.length > 0) setPlans(data); })\n            .catch(console.error);\n        });\n      });\n    }\n  }, [isOpen]);\n\n  const [formData, setFormData] = useState({"
);
editStudent = editStudent.replace(/DEFAULT_PLANS\.map/g, 'plans.map');
fs.writeFileSync('src/components/EditStudentModal.tsx', editStudent);

