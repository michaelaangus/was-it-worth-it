import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { purchasesTable } from "./purchases";

export const reflectionsTable = pgTable("reflections", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseId: uuid("purchase_id")
    .notNull()
    .unique()
    .references(() => purchasesTable.id, { onDelete: "cascade" }),
  verdict: text("verdict").notNull(),
  comments: text("comments"),
  reflectedAt: timestamp("reflected_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ReflectionRow = typeof reflectionsTable.$inferSelect;
export type InsertReflectionRow = typeof reflectionsTable.$inferInsert;
