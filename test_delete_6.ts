import { db } from "./src/db/index.ts";
import { users, studentProfiles, studentSchedules, appointments, workouts, workoutExercises } from "./src/db/schema.ts";
import { eq, inArray, and } from "drizzle-orm";

async function run() {
  const studentId = 6;
  const tenantId = 1;
  try {
      const existingStudent = await db.select().from(users).where(and(eq(users.id, studentId), eq(users.tenantId, tenantId)));
      if (existingStudent.length === 0) {
        console.log("Student not found");
        return;
      }

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
      console.log("Success deleting 6");
  } catch (error) {
      console.error("ERROR", error);
  }
}
run();
