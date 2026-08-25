import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').notNull().default('ALUNO'), // 'SUPER_ADMIN', 'PERSONAL', 'ALUNO'
  tenantId: integer('tenant_id').references(() => tenants.id),
  name: text('name').notNull(),
  phone: text('phone'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  birthDate: text('birth_date'),
  gender: text('gender'),
  profession: text('profession'),
  emergencyContact: text('emergency_contact'),
  objectives: text('objectives'),
  restrictions: text('restrictions'),
  planId: integer('plan_id'),
  paymentDueDate: text('payment_due_date'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  name: text('name').notNull(),
  muscleGroup: text('muscle_group').notNull(),
  description: text('description'),
  videoUrl: text('video_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').references(() => workouts.id).notNull(),
  exerciseId: integer('exercise_id').references(() => exercises.id).notNull(),
  sets: integer('sets').notNull(),
  reps: text('reps').notNull(),
  load: text('load'),
  restTime: text('rest_time'),
  notes: text('notes'),
  orderIndex: integer('order_index').notNull().default(0),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  notes: text('notes'),
  status: text('status').notNull().default('SCHEDULED'), // SCHEDULED, COMPLETED, CANCELLED
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  exercises: many(exercises),
  workouts: many(workouts),
  appointments: many(appointments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  workouts: many(workouts),
  appointments: many(appointments),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  student: one(users, {
    fields: [workouts.studentId],
    references: [users.id],
  }),
  exercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  student: one(users, {
    fields: [appointments.studentId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [appointments.tenantId],
    references: [tenants.id],
  })
}));


export const blockedTimes = pgTable('blocked_times', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const blockedTimesRelations = relations(blockedTimes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [blockedTimes.tenantId],
    references: [tenants.id],
  })
}));

export const publicProfiles = pgTable('public_profiles', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull().unique(),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  location: text('location'),
  instagram: text('instagram'),
  whatsapp: text('whatsapp'),
  enableBooking: boolean('enable_booking').default(true),
  bookingStartTime: text('booking_start_time').default('07:00'),
  bookingEndTime: text('booking_end_time').default('20:00'),
  bookingDays: text('booking_days').default('1,2,3,4,5'),
  heroImageUrl: text('hero_image_url'),
  heroImagePosition: text('hero_image_position').default('background'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  type: text('type').default('INFO'),
  relatedId: integer('related_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  frequency: text('frequency').notNull(),
  price: text('price').notNull(),
  description: text('description'),
  popular: boolean('popular').default(false),
});

export const plansRelations = relations(plans, ({ one }) => ({
  tenant: one(tenants, {
    fields: [plans.tenantId],
    references: [tenants.id],
  })
}));

export const studentSchedules = pgTable('student_schedules', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday...
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
});

export const studentSchedulesRelations = relations(studentSchedules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [studentSchedules.tenantId],
    references: [tenants.id],
  }),
  student: one(users, {
    fields: [studentSchedules.studentId],
    references: [users.id],
  }),
}));
