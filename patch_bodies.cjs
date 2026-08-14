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
  
  // Replace the body padding
  // Old: className="flex-1 overflow-y-auto p-6 md:p-8...
  // New: className="flex-1 overflow-y-auto p-5 md:p-6...
  
  content = content.replace(
    /p-6 md:p-8/g,
    'p-5 md:p-6'
  );

  fs.writeFileSync(file, content);
}

console.log("Patched bodies.");
