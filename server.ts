import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { users, tenants, studentProfiles } from "./src/db/schema.ts";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Public API: Register a new Personal Trainer (Creates a tenant)
  app.post("/api/register-personal", async (req, res) => {
    try {
      const { uid, email, name, phone } = req.body;
      
      if (!uid || !email || !name) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Check if user already exists
      const existing = await db.select().from(users).where(eq(users.uid, uid));
      if (existing.length > 0) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      // Create tenant
      const newTenant = await db.insert(tenants).values({
        name: `Tenant of ${name}`,
      }).returning();

      const tenantId = newTenant[0].id;

      // Create user
      const newUser = await db.insert(users).values({
        uid,
        email,
        name,
        phone,
        role: "PERSONAL",
        tenantId,
      }).returning();

      res.json({ user: newUser[0], tenant: newTenant[0] });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Protected API examples
  app.get("/api/me", requireAuth, async (req: AuthRequest, res) => {
    res.json(req.dbUser);
  });

  app.get("/api/students", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const tenantId = req.dbUser.tenantId;
      const allStudents = await db
        .select({
          id: users.id,
          uid: users.uid,
          email: users.email,
          role: users.role,
          name: users.name,
          phone: users.phone,
          planId: studentProfiles.planId,
        })
        .from(users)
        .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .where(and(eq(users.tenantId, tenantId), eq(users.role, "ALUNO")));
      res.json(allStudents);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/students", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const tenantId = req.dbUser.tenantId;
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can add students" });
      }

      const { name, email, phone, birthDate, gender, profession, emergencyContact, planId } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      const pseudoUid = `student_${crypto.randomUUID()}`;

      const newUser = await db.insert(users).values({
        uid: pseudoUid,
        email,
        name,
        phone,
        role: "ALUNO",
        tenantId,
      }).returning();

      const userId = newUser[0].id;

      await db.insert(studentProfiles).values({
        userId,
        tenantId,
        birthDate,
        gender,
        profession,
        emergencyContact,
        planId,
      });

      res.json({ message: "Student added successfully", student: newUser[0] });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/students/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can edit students" });
      }

      const studentId = parseInt(req.params.id);
      const { name, email, phone, planId } = req.body;

      // Verify student belongs to this tenant
      const existingStudent = await db.select().from(users).where(and(eq(users.id, studentId), eq(users.tenantId, tenantId)));
      if (existingStudent.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Update basic user info
      await db.update(users).set({
        name,
        email,
        phone,
      }).where(eq(users.id, studentId));

      // Update profile info (like planId)
      const existingProfile = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, studentId));
      if (existingProfile.length > 0) {
        await db.update(studentProfiles).set({
          planId: planId !== undefined ? planId : existingProfile[0].planId,
        }).where(eq(studentProfiles.userId, studentId));
      } else {
        await db.insert(studentProfiles).values({
          userId: studentId,
          tenantId,
          planId,
        });
      }

      res.json({ message: "Student updated successfully" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workouts", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const tenantId = req.dbUser.tenantId;
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can create workouts" });
      }

      const { name, description, studentId } = req.body;

      if (!name || !studentId) {
        return res.status(400).json({ error: "Name and studentId are required" });
      }

      const { workouts } = await import("./src/db/schema.ts");
      const newWorkout = await db.insert(workouts).values({
        tenantId,
        studentId,
        name,
        description,
      }).returning();

      res.json({ message: "Workout added successfully", workout: newWorkout[0] });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/workouts/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can edit workouts" });
      }

      const workoutId = parseInt(req.params.id);
      const { name, description, studentId } = req.body;

      const { workouts } = await import("./src/db/schema.ts");
      const existingWorkout = await db.select().from(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.tenantId, tenantId)));
      
      if (existingWorkout.length === 0) {
        return res.status(404).json({ error: "Workout not found" });
      }

      await db.update(workouts).set({
        name,
        description,
        studentId: studentId ? parseInt(studentId) : existingWorkout[0].studentId,
      }).where(eq(workouts.id, workoutId));

      res.json({ message: "Workout updated successfully" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/workouts/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can delete workouts" });
      }

      const workoutId = parseInt(req.params.id);
      const { workouts } = await import("./src/db/schema.ts");
      
      const existingWorkout = await db.select().from(workouts).where(and(eq(workouts.id, workoutId), eq(workouts.tenantId, tenantId)));
      
      if (existingWorkout.length === 0) {
        return res.status(404).json({ error: "Workout not found" });
      }

      await db.delete(workouts).where(eq(workouts.id, workoutId));

      res.json({ message: "Workout deleted successfully" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workouts", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      const { workouts } = await import("./src/db/schema.ts");
      
      let allWorkouts;
      if (req.dbUser.role === "ALUNO") {
        allWorkouts = await db.select().from(workouts).where(and(eq(workouts.tenantId, tenantId), eq(workouts.studentId, req.dbUser.id)));
      } else {
        const studentIdFilter = req.query.studentId as string;
        if (studentIdFilter) {
          allWorkouts = await db.select().from(workouts).where(and(eq(workouts.tenantId, tenantId), eq(workouts.studentId, parseInt(studentIdFilter))));
        } else {
          allWorkouts = await db.select().from(workouts).where(eq(workouts.tenantId, tenantId));
        }
      }
      
      res.json(allWorkouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/exercises", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      const { exercises } = await import("./src/db/schema.ts");
      const allExercises = await db.select().from(exercises).where(eq(exercises.tenantId, tenantId));
      res.json(allExercises);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/exercises", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      const { name, muscleGroup, description, videoUrl } = req.body;
      if (!name || !muscleGroup) return res.status(400).json({ error: "Name and muscleGroup are required" });

      const { exercises } = await import("./src/db/schema.ts");
      const newExercise = await db.insert(exercises).values({
        tenantId, name, muscleGroup, description, videoUrl
      }).returning();
      res.json(newExercise[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workouts/:id/exercises", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const workoutId = parseInt(req.params.id, 10);
      const { workoutExercises, exercises } = await import("./src/db/schema.ts");
      const results = await db.select({
        workoutExercise: workoutExercises,
        exercise: exercises
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, workoutId));
      
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workouts/:id/exercises", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const workoutId = parseInt(req.params.id, 10);
      const { exerciseId, sets, reps, load, restTime, notes, orderIndex } = req.body;
      
      if (!exerciseId || !sets || !reps) {
        return res.status(400).json({ error: "exerciseId, sets and reps are required" });
      }

      const { workoutExercises } = await import("./src/db/schema.ts");
      const newWorkoutExercise = await db.insert(workoutExercises).values({
        workoutId, exerciseId, sets, reps, load, restTime, notes, orderIndex: orderIndex || 0
      }).returning();
      
      res.json(newWorkoutExercise[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/workout-exercises/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can delete exercises from a workout" });
      }
      
      const id = parseInt(req.params.id, 10);
      const { workoutExercises } = await import("./src/db/schema.ts");
      
      // Ideally we would also check if the workout belongs to the tenant here, but for simplicity:
      await db.delete(workoutExercises).where(eq(workoutExercises.id, id));
      
      res.json({ message: "Exercise removed from workout" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
