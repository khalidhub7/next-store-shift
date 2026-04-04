"use server";

import { cookies } from "next/headers";
import { login } from "@/lib/auth/login";
import { logout } from "@/lib/auth/logout";
import { register } from "@/lib/auth/register";
import { authSchema } from "@/lib/validators/auth";

const cookieOptions: any = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 3
}

const loginAction = async (data: unknown) => {
  const values = authSchema.parse(data); // server validation
  const { email, password } = values;
  const { sessionId } = await login(email, password);
  if (sessionId) {
    const store = await cookies();
    store.set("sessionId", sessionId, cookieOptions);
  }
};

const registerAction = async (data: unknown) => {
  const values = authSchema.parse(data);
  const { email, password } = values;
  const { sessionId, userId } = await register(email, password);

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
