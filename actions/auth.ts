import { cookies } from "next/headers";
import { login } from "@/lib/auth/login";
import { logout } from "@/lib/auth/logout";
import { register } from "@/lib/auth/register";

const loginAction = async (formData: FormData) => {
  const { email, password } = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { sessionId } = await login(email, password);
  if (sessionId) {
    const store = await cookies();
    store.set("sessionId", sessionId, { httpOnly: true });
  }
};

const registerAction = async (formData: FormData) => {
  const { email, password } = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { sessionId, userId } = await register(email, password);

  if (sessionId && userId) {
    const store = await cookies();
    store.set("sessionId", sessionId, { httpOnly: true });
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

export { loginAction, registerAction };
