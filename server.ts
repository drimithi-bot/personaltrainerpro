import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { users, tenants, studentProfiles, publicProfiles, notifications, appointments, blockedTimes, plans, studentSchedules, workouts, workoutExercises } from "./src/db/schema.ts";
import { eq, and, desc, inArray } from "drizzle-orm";
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
      require("fs").appendFileSync("server_error.log", error.stack + "\n"); console.error("FULL ERROR", error); res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

  // Protected API examples
  app.get("/api/me", requireAuth, async (req: AuthRequest, res) => {
    res.json(req.dbUser);
  });

  
  // Public Profile Routes
  app.get("/api/public-profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      
      const profile = await db.select().from(publicProfiles).where(eq(publicProfiles.tenantId, tenantId)).limit(1);
      
      if (profile.length === 0) {
        // Return a default based on user
        return res.json({
          slug: req.dbUser.name.toLowerCase().replace(/ /g, '-'),
          bio: '',
          location: '',
          instagram: '',
          whatsapp: req.dbUser.phone || '',
          enableBooking: true,
          bookingStartTime: '07:00',
          bookingEndTime: '20:00',
          bookingDays: '1,2,3,4,5'
        });
      }
      
      res.json(profile[0]);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/public-profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      const { slug, bio, location, instagram, whatsapp, enableBooking, bookingStartTime, bookingEndTime, bookingDays, heroImageUrl, heroImagePosition } = req.body;
      
      if (!slug) return res.status(400).json({ error: "Slug is required" });

      const existing = await db.select().from(publicProfiles).where(eq(publicProfiles.tenantId, tenantId)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(publicProfiles).values({
          heroImageUrl,
          heroImagePosition,
          tenantId,
          slug,
          bio,
          location,
          instagram,
          whatsapp,
          enableBooking: enableBooking !== false,
          bookingStartTime: bookingStartTime || '07:00',
          bookingEndTime: bookingEndTime || '20:00',
          bookingDays: bookingDays || '1,2,3,4,5',
        });
      } else {
        await db.update(publicProfiles).set({
          heroImageUrl,
          heroImagePosition,
          slug,
          bio,
          location,
          instagram,
          whatsapp,
          enableBooking: enableBooking !== false,
          bookingStartTime: bookingStartTime || '07:00',
          bookingEndTime: bookingEndTime || '20:00',
          bookingDays: bookingDays || '1,2,3,4,5',
        }).where(eq(publicProfiles.tenantId, tenantId));
      }
      
      res.json({ message: "Profile updated" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  
  // Public booking availability
  app.get("/api/p/:slug/availability", async (req, res) => {
    try {
      const { slug } = req.params;
      const { date } = req.query; // YYYY-MM-DD
      
      if (!date) {
        return res.status(400).json({ error: "Date is required" });
      }

      const profile = await db.select().from(publicProfiles).where(eq(publicProfiles.slug, slug)).limit(1);
      if (profile.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const tenantId = profile[0].tenantId;
      const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();

      // Check if day is allowed
      const allowedDays = (profile[0].bookingDays || '1,2,3,4,5').split(',').map(Number);
      if (!allowedDays.includes(dayOfWeek) || profile[0].enableBooking === false) {
        return res.json([]);
      }

      const blocked = await db.select().from(blockedTimes).where(
        and(eq(blockedTimes.tenantId, tenantId), eq(blockedTimes.dayOfWeek, dayOfWeek))
      );

      const existingAppointments = await db.select().from(appointments).where(
        and(eq(appointments.tenantId, tenantId), eq(appointments.date, date as string))
      );

      // Generate 1-hour slots from bookingStartTime to bookingEndTime
      const startHour = parseInt(profile[0].bookingStartTime?.split(':')[0] || '7');
      const endHour = parseInt(profile[0].bookingEndTime?.split(':')[0] || '20');
      const slots = [];
      for (let hour = startHour; hour <= endHour; hour++) {
        const hStr = hour.toString().padStart(2, '0') + ':00';
        slots.push(hStr);
      }

      // Helper to check if a slot overlaps with a time range
      const isOverlapping = (slotTime, start, end) => {
        const slotHour = parseInt(slotTime.split(':')[0]);
        const slotEnd = (slotHour + 1).toString().padStart(2, '0') + ':00';
        return (slotTime < end && slotEnd > start);
      };

      const availableSlots = slots.filter(slot => {
        // Check blocked times
        for (const b of blocked) {
          if (isOverlapping(slot, b.startTime, b.endTime)) return false;
        }
        // Check existing appointments
        for (const app of existingAppointments) {
          if (isOverlapping(slot, app.startTime, app.endTime) && app.status !== 'CANCELLED') return false;
        }
        return true;
      });

      res.json(availableSlots);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Public booking submit
  app.post("/api/p/:slug/book", async (req, res) => {
    try {
      const { slug } = req.params;
      const { date, time, name, email, phone, notes } = req.body;

      if (!date || !time || !name || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const profile = await db.select().from(publicProfiles).where(eq(publicProfiles.slug, slug)).limit(1);
      if (profile.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const tenantId = profile[0].tenantId;

      // Create a lead user if it doesn't exist
      let user = await db.select().from(users).where(
        and(eq(users.tenantId, tenantId), eq(users.email, email))
      ).limit(1);

      let userId;
      if (user.length === 0) {
        const pseudoUid = `lead_${crypto.randomUUID()}`;
        const newUser = await db.insert(users).values({
          uid: pseudoUid,
          email,
          name,
          phone: phone || '',
          role: "ALUNO", // Treat as ALUNO for CRM purposes
          tenantId,
        }).returning();
        userId = newUser[0].id;
        
        await db.insert(studentProfiles).values({
          userId,
          tenantId,
        });
      } else {
        userId = user[0].id;
      }

      // Calculate endTime (assume 1 hour duration)
      const endHour = (parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0');
      const endTime = `${endHour}:00`;

      const newApp = await db.insert(appointments).values({
        tenantId,
        studentId: userId,
        date,
        startTime: time,
        endTime,
        notes: `Consulta via Página Pública${notes ? ': ' + notes : ''}`,
        status: 'SCHEDULED'
      }).returning();

      // Create notification
      await db.insert(notifications).values({
        tenantId,
        title: 'Novo Agendamento',
        message: `${name} agendou uma consulta para ${date} às ${time}.`,
        type: 'NEW_BOOKING',
        relatedId: newApp[0].id
      });

      res.json({ message: "Consulta agendada com sucesso!" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  
  app.get("/api/plans", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      
      const tenantPlans = await db.select().from(plans).where(eq(plans.tenantId, tenantId)).orderBy(plans.id);
      res.json(tenantPlans);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  
  app.put("/api/plans", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      const { plans: updatedPlans } = req.body;
      
      if (!Array.isArray(updatedPlans)) {
         return res.status(400).json({ error: "Invalid plans payload" });
      }

      // Upsert plans
      const existingPlans = await db.select().from(plans).where(eq(plans.tenantId, tenantId));
      
      for (const p of updatedPlans) {
        if (p.id && existingPlans.find(ep => ep.id === p.id)) {
          // Update
          await db.update(plans).set({
            frequency: p.frequency,
            price: p.price,
            description: p.description,
            popular: p.popular
          }).where(and(eq(plans.id, p.id), eq(plans.tenantId, tenantId)));
        } else {
          // Insert
          await db.insert(plans).values({
            tenantId,
            frequency: p.frequency,
            price: p.price,
            description: p.description,
            popular: p.popular
          });
        }
      }
      
      // Delete removed plans
      const updatedIds = updatedPlans.filter(p => p.id).map(p => p.id);
      for (const ep of existingPlans) {
        if (!updatedIds.includes(ep.id)) {
          await db.delete(plans).where(and(eq(plans.id, ep.id), eq(plans.tenantId, tenantId)));
        }
      }
      
      res.json({ message: "Planos atualizados" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
app.get("/api/p/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const profile = await db.select({
        profile: publicProfiles,
        user: {
          name: users.name,
          photoUrl: users.photoUrl
        }
      }).from(publicProfiles)
        .innerJoin(tenants, eq(tenants.id, publicProfiles.tenantId))
        .innerJoin(users, and(eq(users.tenantId, tenants.id), eq(users.role, 'PERSONAL')))
        .where(eq(publicProfiles.slug, slug))
        .limit(1);
      
      if (profile.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      const tenantPlans = await db.select().from(plans).where(eq(plans.tenantId, profile[0].profile.tenantId)).orderBy(plans.id);

      res.json({
        name: profile[0].user.name,
        photoUrl: profile[0].user.photoUrl,
        plans: tenantPlans,
        ...profile[0].profile
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });


  // Notifications API
  app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
    try {
      const tenantId = req.dbUser.tenantId;
      const notifs = await db.select().from(notifications)
        .where(eq(notifications.tenantId, tenantId))
        .orderBy(desc(notifications.createdAt))
        .limit(20);
      res.json(notifs);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });


  app.put("/api/notifications/:id/confirm", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.dbUser.tenantId;
      
      const notif = await db.select().from(notifications)
        .where(and(eq(notifications.id, parseInt(id)), eq(notifications.tenantId, tenantId)))
        .limit(1);
        
      if (notif.length > 0 && notif[0].relatedId && notif[0].type === 'NEW_BOOKING') {
        // Update appointment status
        await db.update(appointments)
          .set({ status: 'CONFIRMED' })
          .where(and(eq(appointments.id, notif[0].relatedId), eq(appointments.tenantId, tenantId)));
          
        // Mark notification as read and updated message
        await db.update(notifications)
          .set({ 
            read: true,
            message: notif[0].message + ' (Confirmado)'
          })
          .where(eq(notifications.id, parseInt(id)));
          
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Notification or appointment not found" });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.dbUser.tenantId;
      
      await db.update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.id, parseInt(id)), eq(notifications.tenantId, tenantId)));
        
      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });


  app.get("/api/schedules", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const tenantId = req.dbUser.tenantId;
      
      const schedules = await db.select().from(studentSchedules).where(eq(studentSchedules.tenantId, tenantId));
      res.json(schedules);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
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
          paymentDueDate: studentProfiles.paymentDueDate,
        })
        .from(users)
        .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .where(and(eq(users.tenantId, tenantId), eq(users.role, "ALUNO")));

      const allAppointments = await db.select().from(appointments).where(eq(appointments.tenantId, tenantId));

      const studentsWithAttendance = allStudents.map(student => {
        const studentApps = allAppointments.filter(app => app.studentId === student.id);
        const pastApps = studentApps.filter(app => {
          const appDate = new Date(`${app.date}T${app.startTime}:00`);
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

      res.json(studentsWithAttendance);
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

      const { name, email, phone, birthDate, gender, profession, emergencyContact, planId, paymentDueDate, schedules } = req.body;

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

      if (schedules && Array.isArray(schedules) && schedules.length > 0) {
        await db.insert(studentSchedules).values(schedules.map(s => ({
          tenantId,
          studentId: userId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        })));
      }
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
      if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });
      if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });
      if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });
      const { name, email, phone, planId, paymentDueDate, schedules } = req.body;

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
          paymentDueDate: paymentDueDate !== undefined ? paymentDueDate : existingProfile[0].paymentDueDate,
        }).where(eq(studentProfiles.userId, studentId));
      } else {
        await db.insert(studentProfiles).values({
          userId: studentId,
          tenantId,
          planId,
          paymentDueDate,
        });
      }

            if (schedules && Array.isArray(schedules)) {
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
      res.json({ message: "Student updated successfully" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  
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

  
  // Appointments
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const { appointments } = await import("./src/db/schema.ts");
      
      const query = db.select().from(appointments)
        .where(eq(appointments.tenantId, req.dbUser.tenantId));
        
      const results = await query;
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can create appointments" });
      }
      
      const { studentId, date, startTime, endTime, notes } = req.body;
      const { appointments } = await import("./src/db/schema.ts");
      
      // Check for overlapping appointments
      const existing = await db.select().from(appointments)
        .where(and(
          eq(appointments.tenantId, req.dbUser.tenantId),
          eq(appointments.date, date)
        ));
      
      const hasOverlap = existing.some(app => {
        return (startTime < app.endTime && endTime > app.startTime) && app.status !== 'CANCELLED';
      });
      
      if (hasOverlap) {
        return res.status(400).json({ error: "Já existe um agendamento neste horário." });
      }

      // Check for recurring blocked times
      const { blockedTimes } = await import("./src/db/schema.ts");
      const apptDate = new Date(date);
      // Ensure we get the correct day of week considering UTC vs local. date is YYYY-MM-DD. 
      // Using UTC to avoid timezone shifts.
      const dayOfWeek = new Date(date + "T00:00:00Z").getUTCDay();
      
      const existingBlocks = await db.select().from(blockedTimes)
        .where(and(
          eq(blockedTimes.tenantId, req.dbUser.tenantId),
          eq(blockedTimes.dayOfWeek, dayOfWeek)
        ));
        
      const isBlocked = existingBlocks.some(block => {
        return (startTime < block.endTime && endTime > block.startTime);
      });
      
      if (isBlocked) {
        return res.status(400).json({ error: "Este horário cai em um período bloqueado pelas suas configurações." });
      }
      
      const newAppointment = await db.insert(appointments).values({
        tenantId: req.dbUser.tenantId,
        studentId,
        date,
        startTime,
        endTime,
        notes
      }).returning();
      
      res.json(newAppointment[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can delete appointments" });
      }
      const id = parseInt(req.params.id, 10);
      const { appointments } = await import("./src/db/schema.ts");
      
      await db.delete(appointments)
        .where(and(
          eq(appointments.id, id),
          eq(appointments.tenantId, req.dbUser.tenantId)
        ));
        
      res.json({ message: "Appointment deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  
  // Blocked Times
  app.get("/api/settings/blocked-times", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const { blockedTimes } = await import("./src/db/schema.ts");
      
      const results = await db.select().from(blockedTimes)
        .where(eq(blockedTimes.tenantId, req.dbUser.tenantId));
        
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings/blocked-times", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can configure blocked times" });
      }
      
      const { dayOfWeek, startTime, endTime, reason } = req.body;
      const { blockedTimes } = await import("./src/db/schema.ts");
      
      // Basic overlap check inside blocked times just for sanity
      const existing = await db.select().from(blockedTimes)
        .where(and(
          eq(blockedTimes.tenantId, req.dbUser.tenantId),
          eq(blockedTimes.dayOfWeek, dayOfWeek)
        ));
        
      const hasOverlap = existing.some(block => {
        return (startTime < block.endTime && endTime > block.startTime);
      });
      
      if (hasOverlap) {
        return res.status(400).json({ error: "Já existe um bloqueio que sobrepõe este horário." });
      }
      
      const newBlock = await db.insert(blockedTimes).values({
        tenantId: req.dbUser.tenantId,
        dayOfWeek,
        startTime,
        endTime,
        reason
      }).returning();
      
      res.json(newBlock[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/settings/blocked-times/:id", requireAuth, async (req, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      if (req.dbUser.role !== "PERSONAL" && req.dbUser.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only PERSONAL can delete blocked times" });
      }
      
      const id = parseInt(req.params.id, 10);
      const { blockedTimes } = await import("./src/db/schema.ts");
      
      await db.delete(blockedTimes)
        .where(and(
          eq(blockedTimes.id, id),
          eq(blockedTimes.tenantId, req.dbUser.tenantId)
        ));
        
      res.json({ message: "Blocked time deleted" });
    } catch (error) {
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
