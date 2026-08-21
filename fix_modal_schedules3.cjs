const fs = require('fs');

function fixFile(file, isEdit) {
  let content = fs.readFileSync(file, 'utf8');
  let fetchCall = isEdit ? "const res = await fetch(`/api/students/${student.id}`, {" : "const res = await fetch('/api/students', {";
  
  let startIdx = content.indexOf(fetchCall);
  let resOkIdx = content.indexOf('if (!res.ok) {', startIdx);
  
  if (startIdx !== -1 && resOkIdx !== -1) {
    let before = content.substring(0, startIdx);
    let after = content.substring(resOkIdx);
    
    let newFetch = isEdit ? `      const res = await fetch(\`/api/students/\${student.id}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ name, email, phone, planId: planId ? parseInt(planId) : null, paymentDueDate, schedules })
      });
      ` : `      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ name, email, phone, birthDate, gender, planId: planId ? parseInt(planId) : null, paymentDueDate, schedules })
      });
      `;
      
    fs.writeFileSync(file, before + newFetch + after);
  }
}

fixFile('src/components/AddStudentModal.tsx', false);
fixFile('src/components/EditStudentModal.tsx', true);

