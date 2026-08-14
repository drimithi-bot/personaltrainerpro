const fs = require('fs');
let code = fs.readFileSync('src/components/PublicTrainerProfileView.tsx', 'utf8');

// Find the useEffect that fetches profile
// Wait, we can't easily parse this without breaking something. Let's just do a simple replacement for the default date.

const oldUseState = `  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });`;

const newUseState = `  const [selectedDate, setSelectedDate] = useState('');

  // When profile loads, set a sensible default date
  useEffect(() => {
    if (profile && !profile.notFound && !selectedDate) {
      const allowedDays = (profile.bookingDays || '1,2,3,4,5').split(',').map(Number);
      let date = new Date();
      date.setDate(date.getDate() + 1); // Start checking from tomorrow
      let maxTries = 14;
      while (!allowedDays.includes(date.getDay()) && maxTries > 0) {
        date.setDate(date.getDate() + 1);
        maxTries--;
      }
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  }, [profile, selectedDate]);`;

code = code.replace(oldUseState, newUseState);

// The API fetch for availability should wait for selectedDate to not be empty
const oldFetch = `    const fetchSlots = async () => {
      setFetchingSlots(true);
      try {
        const res = await fetch(\`/api/p/\${username}/availability?date=\${selectedDate}\`);`;

const newFetch = `    const fetchSlots = async () => {
      if (!selectedDate) return;
      setFetchingSlots(true);
      try {
        const res = await fetch(\`/api/p/\${username}/availability?date=\${selectedDate}\`);`;

code = code.replace(oldFetch, newFetch);

fs.writeFileSync('src/components/PublicTrainerProfileView.tsx', code);
