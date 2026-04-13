import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "../db/session";
import { deleteSession } from "../db/session";

const requireUser = async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) redirect("/login");

  const session = await getSession(sessionId);

  if (!session) redirect("/login");

  const isExpired = new Date(session.expiresAt) < new Date();

  if (isExpired) {
    await deleteSession(sessionId);
    cookieStore.delete("sessionId");
    redirect("/login");
  }

  return session.userId;
};

export { requireUser };