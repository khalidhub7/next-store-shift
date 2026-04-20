"use server";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { cookies, headers } from "next/headers";
import { getCartIdByUserId } from "../cart/server";
import { LoginData, RegisterData } from "./schema";
import { login, logout, register } from "./service";
import { getUserIdBySessionId } from "./db/session";
import { registerSchema, loginSchema } from "./schema";

const cookieOptions: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2] =
  {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    // maxAge: 60 * 60 * 24 * 3,
    maxAge: 60,
  };

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});
const h = await headers();

const loginAction = async (data: LoginData) => {
  // server validation
  const values = loginSchema.parse(data);
  const { email, password } = values;

  // rate limiter
  const ip =
    h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown";
  const identifier = `${ip}:${email}`;

  const { success } = await ratelimit.limit(identifier);
  if (!success) return { rateLimit: false };

  // login
  const { sessionId } = await login(email, password);
  if (sessionId) {
    const store = await cookies();
    store.set("sessionId", sessionId, cookieOptions);

    // restore cart
    const userId = await getUserIdBySessionId(sessionId);
    if (userId) {
      const cartId = await getCartIdByUserId(userId);
      if (cartId) {
        store.set("cart", cartId, cookieOptions);
      }
    }
  }
  return { rateLimit: false };
};

const registerAction = async (data: RegisterData) => {
  const values = registerSchema.parse(data);
  const { email, password, name } = values;
  const { sessionId, userId } = await register(email, password, name);

  if (sessionId && userId) {
    const store = await cookies();
    store.set("sessionId", sessionId, cookieOptions);
  }
};

const logoutAction = async () => {
  const store = await cookies();
  const sessionId = store.get("sessionId");

  if (sessionId) {
    await logout(sessionId.value); // rm from db
    store.delete("sessionId");
  }
};

export { loginAction, registerAction, logoutAction };
