const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `      const allStudents = await db
        .select({
          id: users.id,
          uid: users.uid,
          email: users.email,
          role: users.role,
          name: users.name,
          phone: users.phone,
          planId: studentProfiles.planId,
          paymentDueDate: studentProfiles.paymentDueDate,
        })
        .from(users)
        .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .where(and(eq(users.tenantId, tenantId), eq(users.role, "ALUNO")));

      const allAppointments = await db.select().from(appointments).where(eq(appointments.tenantId, tenantId));

      const studentsWithAttendance = allStudents.map(student => {
        const studentApps = allAppointments.filter(app => app.studentId === student.id);
        const pastApps = studentApps.filter(app => {
          const appDate = new Date(\`\${app.date}T\${app.startTime}:00\`);
          return appDate < new Date() || app.status === 'COMPLETED' || app.status === 'CANCELLED';
        });
        
        let attendanceRate = null;
        if (pastApps.length > 0) {
          const completed = pastApps.filter(a => a.status === 'COMPLETED').length;
          attendanceRate = Math.round((completed / pastApps.length) * 100);
        }

        return {
          ...student,
          attendanceRate,
          totalSessions: pastApps.length
        };
      });

      res.json(studentsWithAttendance);`;

const target = `      const allStudents = await db
        .select({
          id: users.id,
          uid: users.uid,
          email: users.email,
          role: users.role,
          name: users.name,
          phone: users.phone,
          planId: studentProfiles.planId,
          paymentDueDate: studentProfiles.paymentDueDate,
        })
        .from(users)
        .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .where(and(eq(users.tenantId, tenantId), eq(users.role, "ALUNO")));
      res.json(allStudents);`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
