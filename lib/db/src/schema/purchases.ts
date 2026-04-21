import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  date,
} from "drizzle-orm/pg-core";

export const purchasesTable = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PurchaseRow = typeof purchasesTable.$inferSelect;
export type InsertPurchaseRow = typeof purchasesTable.$inferInsert;
