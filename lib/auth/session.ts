import { randomUUID } from "crypto";

/* 

lib/auth/* → create object
lib/db.ts → store
actions/* → orchestrate

*/
/* 

Then in actions
const session = createSession(userId); // session logic
await saveSession(session); // db func
cookieStore.set("sessionId", session.sessionId);

*/
const createSession = (userId: string) => {
  // session
  const createdAt = new Date();
  const session = {
    sessionId: randomUUID(),
    userId,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(
      createdAt.getTime() + 1000 * 60 * 60 * 24 * 3, // 3 days
    ).toISOString(),
  };
  return session;
};

const getUserFromSession = (session: any) => {
  if (!session) return null;
  return session.data.userId;
};

const destroySession = () => {
  return;
  // delete should be in db layer only
  // just pass it 👉 Actual delete → in actions using DB
};

const isSessionValid = (session: any) => {
  if (!session) return false;
  return new Date(session.expiresAt) > new Date();
};

export { createSession, getUserFromSession, destroySession, isSessionValid };
