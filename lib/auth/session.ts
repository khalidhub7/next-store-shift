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
const createSession  = async (userId: string) => {
  // session
  const createdAt = new Date();
  const session = {
    sessionId: randomUUID(),
    data: {
      userId,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(
        createdAt.getTime() + 1000 * 60 * 60 * 24 * 3, // 3 days
      ).toISOString(),
    },
  };
  return session;
};
const getUserFromSession = async (sessionId: any) => {
  if (!sessionId) return null;
  // const session = ...; // get from db
  // if (!session) return null;
  // return ...; // get user
}
const destroySession = (sessionId: any) => {
  // to handle later
  return
}


export { createSession, getUserFromSession, destroySession }