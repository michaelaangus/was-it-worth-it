import { Router, type IRouter } from "express";
import { db, purchasesTable, reflectionsTable } from "@workspace/db";
import {
  CreatePurchaseBody,
  ListPurchasesQueryParams,
  UpdatePurchaseBody,
  UpdatePurchaseParams,
  GetPurchaseParams,
  SubmitReflectionBody,
  SubmitReflectionParams,
} from "@workspace/api-zod";
import { and, desc, eq, ilike } from "drizzle-orm";
import { getOrCreateProfile } from "../lib/profile";
import {
  serializePurchase,
  serializeReflection,
} from "../lib/serializers";

const router: IRouter = Router();

router.get("/purchases", async (req, res) => {
  const parsed = ListPurchasesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { status, search, category } = parsed.data;
  const profile = await getOrCreateProfile();

  const conds = [] as unknown[];
  if (search) conds.push(ilike(purchasesTable.name, `%${search}%`));
  if (category) conds.push(eq(purchasesTable.category, category));

  const rows = await db
    .select()
    .from(purchasesTable)
    .where(conds.length ? (and as any)(...conds) : undefined)
    .orderBy(desc(purchasesTable.createdAt));

  const ids = rows.map((r) => r.id);
  const reflections = ids.length
    ? await db
        .select()
        .from(reflectionsTable)
    : [];
  const reflMap = new Map(reflections.map((r) => [r.purchaseId, r]));

  let serialized = rows.map((r) =>
    serializePurchase(r, {
      reflection: reflMap.get(r.id) ?? null,
      reflectionWindowDays: profile.reflectionWindowDays,
    }),
  );
  if (status) serialized = serialized.filter((p) => p.status === status);
  res.json(serialized);
});

router.post("/purchases", async (req, res) => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const profile = await getOrCreateProfile();
  const [created] = await db
    .insert(purchasesTable)
    .values({
      name: parsed.data.name,
      amount: parsed.data.amount.toString(),
      category: parsed.data.category,
      purchaseDate: parsed.data.purchaseDate,
    })
    .returning();
  res.status(201).json(
    serializePurchase(created!, {
      reflection: null,
      reflectionWindowDays: profile.reflectionWindowDays,
    }),
  );
});

router.get("/purchases/:id", async (req, res) => {
  const params = GetPurchaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.flatten() });
    return;
  }
  const { id } = params.data;
  const [row] = await db
    .select()
    .from(purchasesTable)
    .where(eq(purchasesTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [refl] = await db
    .select()
    .from(reflectionsTable)
    .where(eq(reflectionsTable.purchaseId, id));
  const profile = await getOrCreateProfile();
  res.json({
    purchase: serializePurchase(row, {
      reflection: refl ?? null,
      reflectionWindowDays: profile.reflectionWindowDays,
    }),
    reflection: refl ? serializeReflection(refl) : undefined,
  });
});

router.patch("/purchases/:id", async (req, res) => {
  const params = UpdatePurchaseParams.safeParse(req.params);
  const body = UpdatePurchaseBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({
      error: !params.success ? params.error.flatten() : body.error?.flatten(),
    });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.amount !== undefined)
    updates.amount = body.data.amount.toString();
  if (body.data.category !== undefined) updates.category = body.data.category;
  if (body.data.purchaseDate !== undefined)
    updates.purchaseDate = body.data.purchaseDate;

  if (Object.keys(updates).length === 0) {
    const [row] = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.id, params.data.id));
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const profile = await getOrCreateProfile();
    res.json(
      serializePurchase(row, {
        reflection: null,
        reflectionWindowDays: profile.reflectionWindowDays,
      }),
    );
    return;
  }

  const [updated] = await db
    .update(purchasesTable)
    .set(updates)
    .where(eq(purchasesTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [refl] = await db
    .select()
    .from(reflectionsTable)
    .where(eq(reflectionsTable.purchaseId, updated.id));
  const profile = await getOrCreateProfile();
  res.json(
    serializePurchase(updated, {
      reflection: refl ?? null,
      reflectionWindowDays: profile.reflectionWindowDays,
    }),
  );
});

router.post("/purchases/:id/reflection", async (req, res) => {
  const params = SubmitReflectionParams.safeParse(req.params);
  const body = SubmitReflectionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({
      error: !params.success ? params.error.flatten() : body.error?.flatten(),
    });
    return;
  }
  const [row] = await db
    .select()
    .from(purchasesTable)
    .where(eq(purchasesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [existing] = await db
    .select()
    .from(reflectionsTable)
    .where(eq(reflectionsTable.purchaseId, params.data.id));
  let refl;
  if (existing) {
    [refl] = await db
      .update(reflectionsTable)
      .set({
        verdict: body.data.verdict,
        comments: body.data.comments ?? null,
        reflectedAt: new Date(),
      })
      .where(eq(reflectionsTable.id, existing.id))
      .returning();
  } else {
    [refl] = await db
      .insert(reflectionsTable)
      .values({
        purchaseId: params.data.id,
        verdict: body.data.verdict,
        comments: body.data.comments ?? null,
      })
      .returning();
  }
  const profile = await getOrCreateProfile();
  res.status(201).json({
    purchase: serializePurchase(row, {
      reflection: refl!,
      reflectionWindowDays: profile.reflectionWindowDays,
    }),
    reflection: serializeReflection(refl!),
  });
});

export default router;
