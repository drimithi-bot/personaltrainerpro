const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// POST
code = code.replace(
  'const { name, email, phone, birthDate, gender, profession, emergencyContact, planId, paymentDueDate } = req.body;',
  'const { name, email, phone, birthDate, gender, profession, emergencyContact, planId, paymentDueDate, schedules } = req.body;'
);

code = code.replace(
  '      res.json({ message: "Student added successfully", student: newUser[0] });',
  `      if (schedules && Array.isArray(schedules) && schedules.length > 0) {
        await db.insert(studentSchedules).values(schedules.map(s => ({
          tenantId,
          studentId: userId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        })));
      }
      res.json({ message: "Student added successfully", student: newUser[0] });`
);

// PUT
code = code.replace(
  'const { name, email, phone, planId, paymentDueDate } = req.body;',
  'const { name, email, phone, planId, paymentDueDate, schedules } = req.body;'
);

code = code.replace(
  'res.json({ message: "Student updated successfully" });',
  `      if (schedules && Array.isArray(schedules)) {
        await db.delete(studentSchedules).where(eq(studentSchedules.studentId, studentId));
        if (schedules.length > 0) {
          await db.insert(studentSchedules).values(schedules.map(s => ({
            tenantId,
            studentId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime
          })));
        }
      }
      res.json({ message: "Student updated successfully" });`
);

fs.writeFileSync('server.ts', code);
