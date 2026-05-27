import "server-only";
import { randomUUID } from "crypto";
import { Session } from "./types/session";

/* session.helpers.ts → build session object + validate
db/session.ts         → read/write storage
service.ts            → orchestrate (calls helpers + db)
actions.ts            → entry point (cookies, rate limit, call service) */

const createSession = (userId: string) => {
  /* this func need try catch ? hmmm
  no i remember some one tell me before "don’t over-engineer" */

  // session
  const createdAt = new Date();
  const session = {
    sessionId: randomUUID(),
    userId,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(
      createdAt.getTime() + 1000 * 60 * 60 * 24 * 3, // 3 days
      // createdAt.getTime() + 1000 * 60, // 60s for test
    ).toISOString(),
  };
  return session;
};

const getUserFromSession = (session: Session) => {
  if (!session) return null;
  return session.userId;
};

const destroySession = () => {
  return;
  // delete should be in db layer only
  // just pass it 👉 Actual delete → in actions using DB
};

const isSessionValid = (session: Session) => {
  if (!session) return false;
  return new Date(session.expiresAt) > new Date();
};


export { createSession, getUserFromSession, destroySession, isSessionValid };
