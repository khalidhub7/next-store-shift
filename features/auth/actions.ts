"use server";

import { redis } from "@/lib/redis";
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

const loginAction = async (data: LoginData) => {
  try {
    // server validation
    const values = loginSchema.parse(data);
    const { email, password } = values;

    // rate limiter

    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0] ||
      h.get("x-real-ip") ||
      "unknown";
    const key = `login:${ip}:${email}`;

    const attempts = await redis.incr(key);
    if (attempts === 1) await redis.expire(key, 900); // 15 min
    if (attempts > 5)
      return {
        success: false,
        message: "Too many login attempts. Try again later.",
        rateLimit: true,
      };

    // login
    const { sessionId } = await login(email, password);
    if (sessionId) {
      const store = await cookies();
      store.set("sessionId", sessionId, cookieOptions);

      // load cart
      const userId = await getUserIdBySessionId(sessionId);
      if (userId) {
        const cartId = await getCartIdByUserId(userId);
        if (cartId) {
          store.set("cart", cartId, cookieOptions);
        }
      }
      await redis.del(key);
      return { success: true, message: "Logged in", rateLimit: false };
    } else return { success: false, message: "Login failed", rateLimit: false };
  } catch {
    return { success: false, message: "Login failed", rateLimit: false };
  }
};

const registerAction = async (data: RegisterData) => {
  const values = registerSchema.parse(data);
  const { email, password, name } = values;

  const { sessionId, userId } = await register(email, password, name);

  if (sessionId && userId) {
    const store = await cookies();
    store.set("sessionId", sessionId, cookieOptions);
    return { success: true, message: "Account created" };
  } else return { success: false, message: "Signup failed" };
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
