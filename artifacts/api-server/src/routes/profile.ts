import { Router, type IRouter } from "express";
import { db, profileTable, PROFILE_SINGLETON_ID } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { getOrCreateProfile } from "../lib/profile";
import { serializeProfile } from "../lib/serializers";

const router: IRouter = Router();

router.get("/profile", async (_req, res) => {
  const p = await getOrCreateProfile();
  res.json(serializeProfile(p));
});

router.patch("/profile", async (req, res) => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  await getOrCreateProfile();
  const updates: Record<string, unknown> = {};
  if (parsed.data.reflectionWindowDays !== undefined)
    updates.reflectionWindowDays = parsed.data.reflectionWindowDays;
  if (parsed.data.emailReminders !== undefined)
    updates.emailReminders = parsed.data.emailReminders;
  if (parsed.data.inAppReminders !== undefined)
    updates.inAppReminders = parsed.data.inAppReminders;

  if (Object.keys(updates).length > 0) {
    await db
      .update(profileTable)
      .set(updates)
      .where(eq(profileTable.id, PROFILE_SINGLETON_ID));
  }
  const fresh = await getOrCreateProfile();
  res.json(serializeProfile(fresh));
});

export default router;
