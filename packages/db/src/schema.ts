import { pgTable, text, timestamp, boolean, uuid, jsonb, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// 1. BETTER-AUTH TABLES (Required for Auth)
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt"),
  password: text("password"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
});

// ============================================
// 2. ZAPIER LOGIC TABLES
// ============================================

export const zap = pgTable("zap", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").references(() => user.id).notNull(),
  triggerId: text("triggerId"), // Points to the specific trigger instance
  createdAt: timestamp("createdAt").defaultNow(),
});

export const trigger = pgTable("trigger", {
  id: uuid("id").defaultRandom().primaryKey(),
  zapId: uuid("zapId").references(() => zap.id, { onDelete: 'cascade' }).unique(), // One trigger per zap
  triggerId: text("triggerId").notNull(), // e.g., "webhook", "google-sheets"
  metadata: jsonb("metadata").default({}), // Stores webhooks URLs or config
});

export const action = pgTable("action", {
  id: uuid("id").defaultRandom().primaryKey(),
  zapId: uuid("zapId").references(() => zap.id, { onDelete: 'cascade' }).notNull(),
  actionId: text("actionId").notNull(), // e.g., "send-email", "solana-transfer"
  metadata: jsonb("metadata").default({}),
  sortingOrder: integer("sortingOrder").default(0).notNull(), // 0, 1, 2 (execution order)
});

export const zapRun = pgTable("zapRun", {
  id: uuid("id").defaultRandom().primaryKey(),
  zapId: uuid("zapId").references(() => zap.id, { onDelete: 'cascade' }).notNull(),
  metadata: jsonb("metadata").notNull(), // Input data (e.g., webhook body)
  createdAt: timestamp("createdAt").defaultNow(),
});

export const zapRunOutbox = pgTable("zapRunOutbox", {
  id: uuid("id").defaultRandom().primaryKey(),
  zapRunId: uuid("zapRunId").references(() => zapRun.id, { onDelete: 'cascade' }).unique().notNull(),
});

export const availableTrigger = pgTable("availableTrigger", {
  id: text("id").primaryKey(), // e.g. "webhook"
  name: text("name").notNull(),
  image: text("image").notNull(),
});

export const availableAction = pgTable("availableAction", {
  id: text("id").primaryKey(), // e.g. "send-sol"
  name: text("name").notNull(),
  image: text("image").notNull(),
});
// ============================================
// 3. RELATIONS (For easier querying)
// ============================================

export const zapRelations = relations(zap, ({ one, many }) => ({
  trigger: one(trigger, { fields: [zap.id], references: [trigger.zapId] }),
  actions: many(action),
  runs: many(zapRun),
}));

export const triggerRelations = relations(trigger, ({ one }) => ({
  zap: one(zap, { fields: [trigger.zapId], references: [zap.id] }),
}));

export const actionRelations = relations(action, ({ one }) => ({
  zap: one(zap, { fields: [action.zapId], references: [zap.id] }),
}));

export const zapRunRelations = relations(zapRun, ({ one }) => ({
  zap: one(zap, { fields: [zapRun.zapId], references: [zap.id] }),
}));