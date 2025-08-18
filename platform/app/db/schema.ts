import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  varchar,
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


export const promptSessions = pgTable("prompt_sessions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(), 
  action: varchar('action', { length: 20 }).default('pending'),
  duration: integer("duration"), 
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});


export const promptParticipants = pgTable('prompt_participants', {
  id: text('id').primaryKey(),
  promptSessionId: text('prompt_session_id')
   .references(() => promptSessions.id, { onDelete: 'cascade' })
   .notNull(),
  userId: text('user_id')
   .references(() => teams.id, { onDelete: 'cascade' })
   .notNull(),
  score: integer('score').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
  joinedAt: timestamp('joined_at').defaultNow(),
})


export const userPrompts = pgTable('user_prompts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
      .references(() => teams.id, { onDelete: 'cascade' })
      .notNull(),
  sessionId: text('session_id')
  .references(() => promptSessions.id, { onDelete: 'cascade' })
  .notNull(),
  userName: text('user_name')
   .references(() => teams.name, { onDelete: 'cascade' })  
  .notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
