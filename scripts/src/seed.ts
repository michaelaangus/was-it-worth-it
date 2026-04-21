import {
  db,
  pool,
  purchasesTable,
  reflectionsTable,
  profileTable,
  PROFILE_SINGLETON_ID,
} from "@workspace/db";
import { sql } from "drizzle-orm";

async function main() {
  const existing = await db.select().from(purchasesTable);
  if (existing.length > 0) {
    console.log(
      `Skipping seed — ${existing.length} purchases already exist.`,
    );
    await pool.end();
    return;
  }

  await db
    .insert(profileTable)
    .values({ id: PROFILE_SINGLETON_ID })
    .onConflictDoNothing();

  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const sample = [
    { name: "DoorDash dinner", amount: "28.40", category: "food", purchaseDate: daysAgo(2) },
    { name: "Concert ticket", amount: "65.00", category: "entertainment", purchaseDate: daysAgo(20), reflect: { verdict: "worth_it", comments: "Best night I've had in months." } },
    { name: "Spotify Premium", amount: "11.99", category: "subscriptions", purchaseDate: daysAgo(45), reflect: { verdict: "worth_it", comments: "I use it every day." } },
    { name: "Impulse hoodie", amount: "59.00", category: "clothing", purchaseDate: daysAgo(30), reflect: { verdict: "not_worth_it", comments: "Wore it once. Not my style." } },
    { name: "Weekend Airbnb", amount: "182.50", category: "travel", purchaseDate: daysAgo(60), reflect: { verdict: "worth_it" } },
    { name: "App Store game", amount: "4.99", category: "entertainment", purchaseDate: daysAgo(25), reflect: { verdict: "uncertain", comments: "Played it twice." } },
    { name: "Brunch with friends", amount: "34.20", category: "food", purchaseDate: daysAgo(18), reflect: { verdict: "worth_it", comments: "Worth every dollar." } },
    { name: "Late-night Uber", amount: "22.10", category: "other", purchaseDate: daysAgo(40), reflect: { verdict: "not_worth_it", comments: "Could have walked." } },
    { name: "New jeans", amount: "78.00", category: "clothing", purchaseDate: daysAgo(8) },
    { name: "Streaming bundle", amount: "19.99", category: "subscriptions", purchaseDate: daysAgo(15) },
  ] as const;

  for (const item of sample) {
    const [created] = await db
      .insert(purchasesTable)
      .values({
        name: item.name,
        amount: item.amount,
        category: item.category,
        purchaseDate: item.purchaseDate,
      })
      .returning();
    if ("reflect" in item && item.reflect && created) {
      await db.insert(reflectionsTable).values({
        purchaseId: created.id,
        verdict: item.reflect.verdict,
        comments: item.reflect.comments ?? null,
      });
    }
  }
  console.log(`Seeded ${sample.length} purchases.`);
  void sql;
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
