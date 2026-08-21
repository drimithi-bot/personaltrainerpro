const fs = require('fs');
let code = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');

code = code.replace(
  "alert('Erro ao excluir aluno');",
  "alert('Network/Parse Error: ' + error.message);"
);

code = code.replace(
  "alert(data.error || 'Erro ao excluir aluno');",
  "alert('API Error: ' + JSON.stringify(data));"
);

fs.writeFileSync('src/components/StudentsView.tsx', code);
