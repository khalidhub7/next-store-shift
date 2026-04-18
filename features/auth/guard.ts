import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, deleteSession } from "./repository/session";
import { isSessionValid } from "./session.helpers";

const requireUser = async (redirectTo: string) => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) redirect(`/login?redirect=${redirectTo}`);

  const session = await getSession(sessionId);
  if (!session) redirect(`/login?redirect=${redirectTo}`);

  const isValid = isSessionValid(session);

  if (!isValid) {
    await deleteSession(sessionId);
    cookieStore.delete("sessionId");
    redirect(`/login?redirect=${redirectTo}`);
  }

  return session.userId;
};

export { requireUser };
