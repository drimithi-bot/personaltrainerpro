import { db } from "./src/db/index.ts";
import { users, studentProfiles, studentSchedules, appointments, workouts, workoutExercises } from "./src/db/schema.ts";
import { eq, inArray, and } from "drizzle-orm";

async function testDelete() {
  try {
    // Get an ALUNO
    const aluno = await db.select().from(users).where(eq(users.role, "ALUNO")).limit(1);
    if (aluno.length === 0) return console.log("No student found");
    const studentId = aluno[0].id;
    console.log("Found student", studentId);
    
    // 1. Workout Exercises
    const studentWorkouts = await db.select().from(workouts).where(eq(workouts.studentId, studentId));
    if (studentWorkouts.length > 0) {
      const workoutIds = studentWorkouts.map(w => w.id);
      console.log("Deleting workout exercises for workouts:", workoutIds);
      await db.delete(workoutExercises).where(inArray(workoutExercises.workoutId, workoutIds));
    }
    // 2. Workouts
    console.log("Deleting workouts");
    await db.delete(workouts).where(eq(workouts.studentId, studentId));
    // 3. Appointments
    console.log("Deleting appointments");
    await db.delete(appointments).where(eq(appointments.studentId, studentId));
    // 4. Schedules
    console.log("Deleting schedules");
    await db.delete(studentSchedules).where(eq(studentSchedules.studentId, studentId));
    // 5. Profiles
    console.log("Deleting profiles");
    await db.delete(studentProfiles).where(eq(studentProfiles.userId, studentId));
    // 6. User
    console.log("Deleting user");
    await db.delete(users).where(eq(users.id, studentId));

    console.log("Success");
  } catch(e) {
    console.error("Error:", e);
  }
}
testDelete();
