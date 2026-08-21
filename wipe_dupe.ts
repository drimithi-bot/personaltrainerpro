import { db } from "./src/db/index.ts";
import { users, studentProfiles, studentSchedules, appointments, workouts, workoutExercises } from "./src/db/schema.ts";
import { eq, inArray } from "drizzle-orm";

async function run() {
  const idsToDelete = [16, 17]; // The duplicates we saw earlier
  for (const studentId of idsToDelete) {
      console.log("Attempting to force delete student", studentId);
      try {
        const studentWorkouts = await db.select().from(workouts).where(eq(workouts.studentId, studentId));
        if (studentWorkouts.length > 0) {
            const workoutIds = studentWorkouts.map(w => w.id);
            await db.delete(workoutExercises).where(inArray(workoutExercises.workoutId, workoutIds));
        }
        await db.delete(workouts).where(eq(workouts.studentId, studentId));
        await db.delete(appointments).where(eq(appointments.studentId, studentId));
        await db.delete(studentSchedules).where(eq(studentSchedules.studentId, studentId));
        await db.delete(studentProfiles).where(eq(studentProfiles.userId, studentId));
        await db.delete(users).where(eq(users.id, studentId));
        console.log(`Force deleted student ${studentId} from all tables`);
      } catch (e) {
        console.error(`Error deleting ${studentId}:`, e.message);
      }
  }
}
run();
