"use server";

import { cookies } from "next/headers";
import { login } from "@/lib/auth/login";
import { logout } from "@/lib/auth/logout";
import { register } from "@/lib/auth/register";
import { cookieOptions } from "@/lib/auth/cookie";
import { LoginData, RegisterData } from "@/lib/validators/auth";
import { registerSchema, loginSchema } from "@/lib/validators/auth";

const loginAction = async (data: LoginData) => {
  const values = loginSchema.parse(data); // server validation
  const { email, password } = values;
  const { sessionId } = await login(email, password);
  if (sessionId) {
    const store = await cookies();
    store.set("sessionId", sessionId, cookieOptions);
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
