const fs = require('fs');
let code = fs.readFileSync('src/components/StudentsView.tsx', 'utf8');

// Add AlertCircle to lucide-react imports
code = code.replace(
  "import { Plus, Users, Eye, Edit2, Activity } from 'lucide-react';",
  "import { Plus, Users, Eye, Edit2, Activity, AlertCircle } from 'lucide-react';"
);

// We need to calculate `today` inside the map, or outside.
code = code.replace(
  "students.map(student => (",
  "students.map(student => {\n              const isOverdue = student.paymentDueDate && student.paymentDueDate < new Date().toISOString().split('T')[0];\n              return ("
);

// We need to close the block since we changed from implicit to explicit return.
code = code.replace(
  "                  </div>\n                </div>\n              ))\n            )}",
  "                  </div>\n                </div>\n              );\n            })\n            )}"
);

// Actually, wait, let's see how the map ends.
