const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { LogIn, UserPlus, Dumbbell, LayoutDashboard, Users, Calendar, Settings, LogOut, AlertCircle, Search, Activity, BookOpen, DollarSign, Sun, Moon } from 'lucide-react';",
  "import { LogIn, UserPlus, Dumbbell, LayoutDashboard, Users, Calendar, Settings, LogOut, AlertCircle, Search, Activity, BookOpen, DollarSign, Sun, Moon, Bell, CheckCircle } from 'lucide-react';"
);

fs.writeFileSync('src/App.tsx', code);
