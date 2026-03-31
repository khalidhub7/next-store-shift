export const logout = async () => {
  // 1. read cookie
  const cookieStore = await /* cookies() */ null;
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) return;

  // 2. delete session from DB
  await /* deleteSession(sessionId) */ null;

  // 3. clear cookie
  cookieStore.delete("sessionId");

  return { success: true };
};
