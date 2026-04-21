import { Router, type IRouter } from "express";
import { db, purchasesTable, reflectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const CATEGORIES = [
  "food",
  "clothing",
  "entertainment",
  "subscriptions",
  "travel",
  "other",
] as const;

router.get("/insights", async (_req, res) => {
  const purchases = await db.select().from(purchasesTable);
  const reflections = await db.select().from(reflectionsTable);
  const reflMap = new Map(reflections.map((r) => [r.purchaseId, r]));

  const byCat = new Map<
    string,
    {
      totalReflected: number;
      worthItCount: number;
      notWorthItCount: number;
      uncertainCount: number;
      totalSpent: number;
    }
  >();
  for (const c of CATEGORIES)
    byCat.set(c, {
      totalReflected: 0,
      worthItCount: 0,
      notWorthItCount: 0,
      uncertainCount: 0,
      totalSpent: 0,
    });

  let overallReflected = 0;
  let overallWorthIt = 0;
  let totalSpent = 0;
  let regretSpent = 0;

  for (const p of purchases) {
    const amount = Number(p.amount);
    totalSpent += amount;
    const cat = byCat.get(p.category);
    if (!cat) continue;
    cat.totalSpent += amount;
    const refl = reflMap.get(p.id);
    if (refl) {
      cat.totalReflected += 1;
      overallReflected += 1;
      if (refl.verdict === "worth_it") {
        cat.worthItCount += 1;
        overallWorthIt += 1;
      } else if (refl.verdict === "not_worth_it") {
        cat.notWorthItCount += 1;
        regretSpent += amount;
      } else if (refl.verdict === "uncertain") {
        cat.uncertainCount += 1;
      }
    }
  }

  const categories = CATEGORIES.map((c) => {
    const x = byCat.get(c)!;
    const worthItPercent =
      x.totalReflected > 0 ? (x.worthItCount / x.totalReflected) * 100 : 0;
    return {
      category: c,
      totalReflected: x.totalReflected,
      worthItCount: x.worthItCount,
      notWorthItCount: x.notWorthItCount,
      uncertainCount: x.uncertainCount,
      worthItPercent: Math.round(worthItPercent * 10) / 10,
      totalSpent: Math.round(x.totalSpent * 100) / 100,
    };
  });

  res.json({
    categories,
    overallWorthItPercent:
      overallReflected > 0
        ? Math.round((overallWorthIt / overallReflected) * 1000) / 10
        : 0,
    totalSpent: Math.round(totalSpent * 100) / 100,
    regretSpent: Math.round(regretSpent * 100) / 100,
  });
  void eq;
});

export default router;
