const fs = require('fs');

const WEEKDAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

function patchFile(filePath, isEdit) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Add state for schedules and allSchedules
  code = code.replace(
    '  const [planId, setPlanId] = useState(',
    `  const [schedules, setSchedules] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [planId, setPlanId] = useState(`
  );

  // Initialize existing schedules if editing
  if (isEdit) {
    code = code.replace(
      '      setPaymentDueDate(student.paymentDueDate || \'\');',
      '      setPaymentDueDate(student.paymentDueDate || \'\');\n      if (student.schedules) setSchedules(student.schedules);'
    );
  }

  // Fetch all schedules
  code = code.replace(
    'fetch(\'/api/plans\', { headers: { Authorization: `Bearer ${token}` }})',
    `fetch('/api/schedules', { headers: { Authorization: \`Bearer \${token}\` }}).then(res => res.json()).then(data => setAllSchedules(data)).catch(console.error);
          fetch('/api/plans', { headers: { Authorization: \`Bearer \${token}\` }})`
  );

  // Payload modification
  if (isEdit) {
    code = code.replace(
      'const res = await fetch(`/api/students/${student.id}`, {',
      'const res = await fetch(`/api/students/${student.id}`, {\n        method: \'PUT\',\n        headers: {\n          \'Content-Type\': \'application/json\',\n          \'Authorization\': `Bearer ${token}`\n        },\n        body: JSON.stringify({ name, email, phone, planId: planId ? parseInt(planId) : null, paymentDueDate, schedules })\n      });\n      //'
    );
    // Remove the old body and headers block to avoid duplication
    code = code.replace(
      /body: JSON\.stringify\({ name, email, phone, planId: planId \? parseInt\(planId\) : null, paymentDueDate }\)/g,
      '/* updated body */'
    );
  } else {
    code = code.replace(
      'const res = await fetch(\'/api/students\', {',
      'const res = await fetch(\'/api/students\', {\n        method: \'POST\',\n        headers: {\n          \'Content-Type\': \'application/json\',\n          \'Authorization\': `Bearer ${token}`\n        },\n        body: JSON.stringify({ name, email, phone, birthDate, gender, planId: planId ? parseInt(planId) : null, paymentDueDate, schedules })\n      });\n      //'
    );
    code = code.replace(
      /body: JSON\.stringify\({ name, email, phone, birthDate, gender, planId: planId \? parseInt\(planId\) : null, paymentDueDate }\)/g,
      '/* updated body */'
    );
  }

  // Add schedule UI
  const scheduleUI = `
          <div className="border-t border-slate-100 pt-4 mt-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Horários de Treino</label>
            <div className="flex flex-col gap-3 mb-3">
              {schedules.map((schedule, index) => {
                const day = [
                  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
                ][schedule.dayOfWeek];
                return (
                  <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-slate-700">{day} - {schedule.startTime} às {schedule.endTime}</span>
                    <button type="button" onClick={() => setSchedules(schedules.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <select id="newDay" className="border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none">
                <option value="1">Segunda</option>
                <option value="2">Terça</option>
                <option value="3">Quarta</option>
                <option value="4">Quinta</option>
                <option value="5">Sexta</option>
                <option value="6">Sábado</option>
                <option value="0">Domingo</option>
              </select>
              <input type="time" id="newStart" className="border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none" defaultValue="08:00" />
              <input type="time" id="newEnd" className="border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none" defaultValue="09:00" />
            </div>
            <button 
              type="button" 
              onClick={() => {
                const dayOfWeek = parseInt((document.getElementById('newDay') as HTMLSelectElement).value);
                const startTime = (document.getElementById('newStart') as HTMLInputElement).value;
                const endTime = (document.getElementById('newEnd') as HTMLInputElement).value;
                
                // Validate overlap with other students
                const isOverlapping = allSchedules.some(s => {
                  ${isEdit ? 'if (student && s.studentId === student.id) return false;' : ''}
                  if (s.dayOfWeek !== dayOfWeek) return false;
                  return (startTime < s.endTime && endTime > s.startTime);
                });
                
                if (isOverlapping) {
                  setError('Este horário entra em conflito com o agendamento de outro aluno.');
                  return;
                }
                
                // Validate overlap with current student's selected schedules
                const selfOverlap = schedules.some(s => {
                  if (s.dayOfWeek !== dayOfWeek) return false;
                  return (startTime < s.endTime && endTime > s.startTime);
                });
                
                if (selfOverlap) {
                  setError('Você já adicionou um horário conflitante para este aluno.');
                  return;
                }
                
                setError('');
                setSchedules([...schedules, { dayOfWeek, startTime, endTime }]);
              }}
              className="mt-2 w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors"
            >
              Adicionar Horário
            </button>
          </div>
  `;

  code = code.replace(
    '<div className="pt-4 mt-2 border-t border-slate-100 flex gap-3 shrink-0">',
    scheduleUI + '\n          <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3 shrink-0">'
  );

  fs.writeFileSync(filePath, code);
}

patchFile('src/components/AddStudentModal.tsx', false);
patchFile('src/components/EditStudentModal.tsx', true);

// Update StudentsView to fetch schedules and populate students with their schedules
let studentsViewCode = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');
studentsViewCode = studentsViewCode.replace(
  'const [students, setStudents] = useState<any[]>([]);',
  'const [students, setStudents] = useState<any[]>([]);\n  const [schedules, setSchedules] = useState<any[]>([]);'
);
studentsViewCode = studentsViewCode.replace(
  'const data = await res.json();\n        setStudents(data);',
  'const data = await res.json();\n        \n        const resSchedules = await fetch(\'/api/schedules\', { headers: { Authorization: `Bearer ${token}` } });\n        let schedData = [];\n        if (resSchedules.ok) {\n          schedData = await resSchedules.json();\n          setSchedules(schedData);\n        }\n        \n        setStudents(data.map((student: any) => ({ ...student, schedules: schedData.filter((s: any) => s.studentId === student.id) })));'
);

fs.writeFileSync('src/components/StudentsView.tsx', studentsViewCode);

