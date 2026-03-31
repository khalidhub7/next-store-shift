export const login = async (email: string, password: string) => {
  // 1. get user from DB
  const user = /* getUserByEmail(email) */ null;

  if (!user) {
    throw new Error("user not found");
  }

  // 2. check password
  const isValid = /* comparePassword(password, user.password) */ true;

  if (!isValid) {
    throw new Error("invalid credentials");
  }

  // 3. create session
  const session = await /* createSession(user.id) */ null;

  // 4. save session to DB
  await /* saveSession(session) */ null;

  // 5. set cookie
  const cookieStore = await /* cookies() */ null;
  cookieStore.set("sessionId", session.sessionId, {
    // maxAge, httpOnly, etc.
  });

  return { success: true };
};