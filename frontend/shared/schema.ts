import { pgTable, serial, integer, text, timestamp, index, real, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  conversationIdIdx: index("messages_conversation_id_idx").on(table.conversationId),
  createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  magicLinkToken: text("magic_link_token"),
  magicLinkExpiresAt: timestamp("magic_link_expires_at"),
  sessionToken: text("session_token"),
  sessionExpiresAt: timestamp("session_expires_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastLoginAt: timestamp("last_login_at"),
}, (table) => ({
  sessionTokenIdx: index("users_session_token_idx").on(table.sessionToken),
  magicLinkTokenIdx: index("users_magic_link_token_idx").on(table.magicLinkToken),
  emailIdx: index("users_email_idx").on(table.email),
}));

export const userResults = pgTable("user_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dassDepressionEncrypted: text("dass_depression_encrypted").notNull(),
  dassAnxietyEncrypted: text("dass_anxiety_encrypted").notNull(),
  dassStressEncrypted: text("dass_stress_encrypted").notNull(),
  hexacoScores: text("hexaco_scores"),
  teiqueScoresEncrypted: text("teique_scores_encrypted"),
  stabilityAnalysis: text("stability_analysis"),
  rawResponsesEncrypted: text("raw_responses_encrypted"),
  teamCode: text("team_code"),
  completedAt: timestamp("completed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdIdx: index("user_results_user_id_idx").on(table.userId),
  createdAtIdx: index("user_results_created_at_idx").on(table.createdAt),
  userIdCreatedAtIdx: index("user_results_user_created_idx").on(table.userId, table.createdAt),
  teamCodeIdx: index("user_results_team_code_idx").on(table.teamCode),
}));

export const pulseData = pgTable("pulse_data", {
  id: serial("id").primaryKey(),
  periodKey: text("period_key").notNull(),
  avgDepression: real("avg_depression").notNull().default(0),
  avgAnxiety: real("avg_anxiety").notNull().default(0),
  avgStress: real("avg_stress").notNull().default(0),
  avgHonestyHumility: real("avg_honesty_humility").notNull().default(0),
  avgEmotionality: real("avg_emotionality").notNull().default(0),
  avgExtraversion: real("avg_extraversion").notNull().default(0),
  avgAgreeableness: real("avg_agreeableness").notNull().default(0),
  avgConscientiousness: real("avg_conscientiousness").notNull().default(0),
  avgOpenness: real("avg_openness").notNull().default(0),
  avgWellbeing: real("avg_wellbeing").notNull().default(0),
  avgSelfControl: real("avg_self_control").notNull().default(0),
  avgEISociability: real("avg_ei_sociability").notNull().default(0),
  avgGlobalEI: real("avg_global_ei").notNull().default(0),
  sampleCount: integer("sample_count").notNull().default(0),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  periodKeyIdx: index("pulse_data_period_key_idx").on(table.periodKey),
}));

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  leaderUserId: integer("leader_user_id").notNull().references(() => users.id),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  codeIdx: index("teams_code_idx").on(table.code),
  leaderIdx: index("teams_leader_idx").on(table.leaderUserId),
}));

export const contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  inquiryType: text("inquiry_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const inboundMessages = pgTable("inbound_messages", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  resendEmailId: text("resend_email_id"),
  fromEmail: text("from_email").notNull(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull().default(''),
  textBody: text("text_body").notNull().default(''),
  htmlBody: text("html_body"),
  rawPayload: text("raw_payload"),
  status: text("status").notNull().default('received'),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  eventTypeIdx: index("inbound_event_type_idx").on(table.eventType),
  fromEmailIdx: index("inbound_from_email_idx").on(table.fromEmail),
  createdAtIdx: index("inbound_created_at_idx").on(table.createdAt),
  statusIdx: index("inbound_status_idx").on(table.status),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserResult = typeof userResults.$inferSelect;
export type InsertUserResult = typeof userResults.$inferInsert;
export type PulseData = typeof pulseData.$inferSelect;
export type InsertPulseData = typeof pulseData.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InsertContactInquiry = typeof contactInquiries.$inferInsert;
export type InboundMessage = typeof inboundMessages.$inferSelect;
export type InsertInboundMessage = typeof inboundMessages.$inferInsert;
