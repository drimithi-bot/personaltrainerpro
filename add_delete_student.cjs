const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const deleteEndpoint = `
  app.delete("/api/students/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can delete students" });
      }

      const studentId = parseInt(req.params.id);

      // Verify student belongs to this tenant
      const existingStudent = await db.select().from(users).where(and(eq(users.id, studentId), eq(users.tenantId, tenantId)));
      if (existingStudent.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Dynamic imports for related schemas
      const { workouts, workoutExercises } = await import("./src/db/schema.ts");
      const { inArray } = await import("drizzle-orm");

      // Delete dependencies
      // 1. Workout Exercises
      const studentWorkouts = await db.select().from(workouts).where(eq(workouts.studentId, studentId));
      if (studentWorkouts.length > 0) {
        const workoutIds = studentWorkouts.map(w => w.id);
        await db.delete(workoutExercises).where(inArray(workoutExercises.workoutId, workoutIds));
      }
      // 2. Workouts
      await db.delete(workouts).where(eq(workouts.studentId, studentId));
      // 3. Appointments
      await db.delete(appointments).where(eq(appointments.studentId, studentId));
      // 4. Schedules
      await db.delete(studentSchedules).where(eq(studentSchedules.studentId, studentId));
      // 5. Profiles
      await db.delete(studentProfiles).where(eq(studentProfiles.userId, studentId));
      // 6. User
      await db.delete(users).where(eq(users.id, studentId));

      res.json({ message: "Student deleted successfully" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
`;

// Insert the delete endpoint before app.post("/api/workouts"
serverCode = serverCode.replace(
  'app.post("/api/workouts",',
  deleteEndpoint + '\n  app.post("/api/workouts",'
);

fs.writeFileSync('server.ts', serverCode);
