import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { hashSessionId } from "@/features/auth/server";
import { LogoutButton } from "./LogoutButton.client";

const AuthStatus = async () => {
  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) return null;

    const isAuthenticated = !!(await redis.get(
      `session:${hashSessionId(sessionId)}`,
    ));

    if (!isAuthenticated) return null;

    return <LogoutButton />;
  } catch {
    return null;
  }
};

export { AuthStatus };