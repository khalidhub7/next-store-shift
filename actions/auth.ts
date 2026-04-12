"use server";

import { cookies } from "next/headers";
import { login } from "@/lib/auth/login";
import { logout } from "@/lib/auth/logout";
import { register } from "@/lib/auth/register";
import { LoginData, RegisterData } from "@/lib/validators/auth";
import { registerSchema, loginSchema } from "@/lib/validators/auth";

const cookieOptions: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2] =
  {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 3,
  };

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
  const { email, password, name, confirmPassword } = values;
  const { sessionId, userId } = await register(
    email,
    password,
    name,
    confirmPassword,
  );

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
