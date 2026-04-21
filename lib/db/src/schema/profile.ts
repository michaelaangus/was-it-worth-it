import { pgTable, integer, boolean, text } from "drizzle-orm/pg-core";

export const profileTable = pgTable("profile", {
  id: text("id").primaryKey(),
  reflectionWindowDays: integer("reflection_window_days").notNull().default(14),
  emailReminders: boolean("email_reminders").notNull().default(false),
  inAppReminders: boolean("in_app_reminders").notNull().default(true),
});

export const PROFILE_SINGLETON_ID = "default";

export type ProfileRow = typeof profileTable.$inferSelect;
export type InsertProfileRow = typeof profileTable.$inferInsert;
