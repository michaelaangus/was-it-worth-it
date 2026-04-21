import { Router, type IRouter } from "express";
import { db, purchasesTable, reflectionsTable } from "@workspace/db";
import { asc, count } from "drizzle-orm";
import { getOrCreateProfile } from "../lib/profile";
import { serializePurchase } from "../lib/serializers";

const router: IRouter = Router();

router.get("/dashboard", async (_req, res) => {
  const profile = await getOrCreateProfile();

  const purchases = await db
    .select()
    .from(purchasesTable)
    .orderBy(asc(purchasesTable.createdAt));
  const reflections = await db.select().from(reflectionsTable);
  const reflMap = new Map(reflections.map((r) => [r.purchaseId, r]));

  const serialized = purchases.map((p) =>
    serializePurchase(p, {
      reflection: reflMap.get(p.id) ?? null,
      reflectionWindowDays: profile.reflectionWindowDays,
    }),
  );

  const ready = serialized.filter((p) => p.readyForReflection);
  const totalReflected = serialized.filter((p) => p.status === "reflected")
    .length;

  res.json({
    readyForReflectionCount: ready.length,
    totalPurchases: serialized.length,
    totalReflected,
    nextPending: ready[0] ?? serialized.find((p) => p.status === "waiting"),
  });
  void count;
});

export default router;
