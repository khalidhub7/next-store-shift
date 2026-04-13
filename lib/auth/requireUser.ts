import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "../db/session";
import { deleteSession } from "../db/session";

const requireUser = async (redirectTo: string) => {
  // routes that allowed and may need auth
  const saferRoutes = ["/products"];

  const safeRedirect = saferRoutes.includes(redirectTo) ? redirectTo : "/";

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) redirect(`/login${safeRedirect}`);

  const session = await getSession(sessionId);

  if (!session) redirect(`/login${safeRedirect}`);

  const isExpired = new Date(session.expiresAt) < new Date();

  if (isExpired) {
    await deleteSession(sessionId);
    cookieStore.delete("sessionId");
    redirect(`/login${safeRedirect}`);
  }

  return session.userId;
};

export { requireUser };
