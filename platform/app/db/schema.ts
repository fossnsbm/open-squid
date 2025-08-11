import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  jsonb,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";


export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("user").notNull(),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  contactNumber: text("contact_number").notNull(),
  team_members: text("team_members").notNull(),
});

export const team_sessions = pgTable("team_sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});


export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(),
 createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});


export const quizSessions = pgTable('quiz_sessions', {
  id: text('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  status: varchar('status', { length: 20 }).default('pending'), 
  currentQuestionIndex: integer('current_question_index').default(0),
  timePerQuestion: integer('time_per_question').default(10),
  totalQuestions: integer('total_questions'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
})


export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})


export const quizParticipants = pgTable('quiz_participants', {
  id: text('id').primaryKey(),
  quizSessionId: text('quiz_session_id')
   .references(() => quizSessions.id, { onDelete: 'cascade' })
   .notNull(),
  userId: text('user_id')
   .references(() => users.id, { onDelete: 'cascade' })
   .notNull(),
  score: integer('score').default(0),
  totalQuestionsAnswered: integer('total_questions_answered').default(0),
  joinedAt: timestamp('joined_at').defaultNow(),
})



