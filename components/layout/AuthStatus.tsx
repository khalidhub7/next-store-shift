import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { hashSessionId } from "@/features/auth/server";
import { LogoutButton } from "./LogoutButton.client";

const AuthStatus = async () => {
  let isAuthenticated = false;
  try {
    const sessionId = (await cookies()).get("sessionId")?.value;
    if (!sessionId) return null;
    isAuthenticated = !!(await redis.get(
      `session:${hashSessionId(sessionId)}`,
    ));
  } catch {}

  // console.log(`*** ${isAuthenticated} ***`)
  return isAuthenticated ? <LogoutButton /> : null;
};

export { AuthStatus };
