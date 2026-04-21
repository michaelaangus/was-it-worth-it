import type { PurchaseRow, ReflectionRow, ProfileRow } from "@workspace/db";

export function serializeReflection(r: ReflectionRow) {
  return {
    id: r.id,
    purchaseId: r.purchaseId,
    verdict: r.verdict as "worth_it" | "not_worth_it" | "uncertain",
    comments: r.comments ?? undefined,
    reflectedAt: r.reflectedAt.toISOString(),
  };
}

export function serializePurchase(
  p: PurchaseRow,
  opts: { reflection: ReflectionRow | null; reflectionWindowDays: number },
) {
  const { reflection, reflectionWindowDays } = opts;
  const purchaseDateMs = new Date(p.purchaseDate + "T00:00:00Z").getTime();
  const readyAtMs = purchaseDateMs + reflectionWindowDays * 24 * 60 * 60 * 1000;
  const status: "waiting" | "reflected" = reflection ? "reflected" : "waiting";
  const readyForReflection = !reflection && Date.now() >= readyAtMs;
  return {
    id: p.id,
    name: p.name,
    amount: Number(p.amount),
    category: p.category as
      | "food"
      | "clothing"
      | "entertainment"
      | "subscriptions"
      | "travel"
      | "other",
    purchaseDate: p.purchaseDate,
    status,
    readyForReflection,
    readyAt: new Date(readyAtMs).toISOString(),
    createdAt: p.createdAt.toISOString(),
  };
}

export function serializeProfile(p: ProfileRow) {
  return {
    reflectionWindowDays: p.reflectionWindowDays,
    emailReminders: p.emailReminders,
    inAppReminders: p.inAppReminders,
  };
}
