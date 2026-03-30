import { randomUUID } from "crypto";

/* 
auth/* → create object
db.ts → store
actions/* → orchestrate
*/

/* 
Then in actions
const session = createSession(userId);
await createSessionInDb(session);
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


export { createSession }