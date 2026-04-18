"use server";

import { cookies } from "next/headers";
import { cookieOptions } from "./cookies";
import { getCartIdByUserId } from "../cart/server";
import { LoginData, RegisterData } from "./schema";
import { login, logout, register } from "./service";
import { registerSchema, loginSchema } from "./schema";
import { getUserIdBySessionId } from "./repository/session";

const loginAction = async (data: LoginData) => {
  const values = loginSchema.parse(data); // server validation
  const { email, password } = values;
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
