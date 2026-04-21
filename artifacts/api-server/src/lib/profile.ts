import { db, profileTable, PROFILE_SINGLETON_ID } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getOrCreateProfile() {
  const existing = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.id, PROFILE_SINGLETON_ID));
  if (existing[0]) return existing[0];
  const [created] = await db
    .insert(profileTable)
    .values({ id: PROFILE_SINGLETON_ID })
    .returning();
  return created!;
}
