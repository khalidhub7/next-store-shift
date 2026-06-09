/* why scalable

today:  cleanupSessions()
        -> file DB
later:  cleanupSessions()
        -> mySQL
*/

import { getAllSessions } from "./server";
import { getSession, deleteSession } from "./server";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const cleanupSessions = async () => {
  // When moving to MySQL, you'll replace that part with a DB query.
  const sessions = await getAllSessions();

  for (const session of sessions) {
    const oldRevoked =
      session.revokedAt &&
      Date.now() - new Date(session.revokedAt).getTime() > SESSION_TTL_MS;

    if (oldRevoked) {
      await deleteSession(session.sessionId);
    }
  }
};

export { cleanupSessions };
