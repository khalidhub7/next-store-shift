import "server-only";

import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { hashSessionId } from "./service";
import { redirect } from "next/navigation";

/* 
actions.ts        → entry point
service.ts        → business logic
db/*.ts           → persistence
session.helpers   → session logic
guard.ts          → authorization
*/

const requireUser = async (redirectTo: string) => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) redirect(`/login?redirect=${redirectTo}`);

  // if sessionId fake or session expired the redis.get return null
  const userId = await redis.get(`session:${hashSessionId(sessionId)}`);

  if (!userId) {
    cookieStore.delete("sessionId");
    redirect(`/login?redirect=${redirectTo}`);
  }

  return userId;
};

const getCurrentUserId = async (): Promise<string | null> => {
  // For Server Components only.
  // Next.js does not allow cookie mutations in Server Components.
  // Read auth state only.

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) return null;

  const userId = await redis.get(`session:${hashSessionId(sessionId)}`);
  return userId; // return null if expired, DON'T delete
};

export { requireUser, getCurrentUserId };
