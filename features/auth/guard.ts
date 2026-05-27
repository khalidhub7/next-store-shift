import "server-only";

import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { hashSessionId } from "./service";
import { redirect } from "next/navigation";

/* 
actions.ts      → entry point
service.ts      → business logic
db/*.ts         → persistence
session.helpers → session logic
guard.ts        → authorization
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

export { requireUser };
