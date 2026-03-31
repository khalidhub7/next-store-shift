export const requireUser = async () => {
  // 1. read cookie
  const cookieStore = await /* cookies() */ null;
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    /* redirect("/login") */
  }

  // 2. get session from DB
  const session = await /* getSessionById(sessionId) */ null;

  if (!session) {
    /* redirect("/login") */
  }

  // 3. check expiration
  const isValid = /* isSessionValid(session) */ true;

  if (!isValid) {
    /* redirect("/login") */
  }

  // 4. return userId
  return session.data.userId;
};