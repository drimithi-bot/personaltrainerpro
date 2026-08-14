const fs = require('fs');

const filesToPatch = [
  'src/components/CalendarView.tsx',
  'src/components/ExercisesView.tsx',
  'src/components/PricingView.tsx',
  'src/components/SettingsView.tsx',
  'src/components/StudentsView.tsx',
  'src/components/TodaysSessionsView.tsx',
  'src/components/WorkoutDetailsView.tsx',
  'src/components/WorkoutsView.tsx'
];

for (const file of filesToPatch) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the header padding
  // Old: className="p-6 md:p-8 border-b...
  // New: className="px-5 py-4 md:px-6 md:py-5 border-b...
  
  content = content.replace(
    'className="p-6 md:p-8 border-b',
    'className="px-5 py-4 md:px-6 md:py-5 border-b'
  );

  fs.writeFileSync(file, content);
}

console.log("Patched headers.");
