import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, deleteSession } from "../db/session";
import { isSessionValid } from "./session";

const requireUser = async (redirectTo: string) => {
  // routes that allowed and may need auth
  const saferRedirects = ["/products"];

  const safeRedirect = saferRedirects.some((r) => redirectTo.startsWith(r))
    ? redirectTo
    : "/";

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) redirect(`/login?redirect=${safeRedirect}`);

  const session = await getSession(sessionId);
  if (!session) redirect(`/login?redirect=${safeRedirect}`);

  const isValid = isSessionValid(session);

  if (!isValid) {
    await deleteSession(sessionId);
    cookieStore.delete("sessionId");
    redirect(`/login?redirect=${safeRedirect}`);
  }

  return session.userId;
};

export { requireUser };
