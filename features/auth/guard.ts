import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, deleteSession } from "./db/session";
import { isSessionValid } from "./session.helpers";
import { hashSessionId } from "./service";

const requireUser = async (redirectTo: string) => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) redirect(`/login?redirect=${redirectTo}`);

  const session = await getSession(hashSessionId(sessionId));
  if (!session) {
    cookieStore.delete("sessionId");
    redirect(`/login?redirect=${redirectTo}`);
  }

  const isValid = isSessionValid(session);

  if (!isValid) {
    await deleteSession(hashSessionId(sessionId));
    cookieStore.delete("sessionId");
    redirect(`/login?redirect=${redirectTo}`);
  }

  return session.userId;
};

export { requireUser };
