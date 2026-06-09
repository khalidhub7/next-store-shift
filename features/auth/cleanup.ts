/* why scalable

today:  cleanupSessions()
        -> file DB
later:  cleanupSessions()
        -> mySQL


Delete sessions that are:
- expired for 30+ days
- revoked for 30+ days
*/

import { getAllSessions } from "./server";
import { deleteSession } from "./server";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const cleanupSessions = async () => {
  // When moving to MySQL, you'll replace that part with a DB query.
  const sessions = await getAllSessions();

  for (const session of sessions) {
    const oldExpired =
      Date.now() > new Date(session.expiresAt).getTime() + SESSION_TTL_MS;

    const oldRevoked =
      session.revokedAt != null &&
      Date.now() > new Date(session.revokedAt).getTime() + SESSION_TTL_MS;

    if (oldRevoked || oldExpired) {
      await deleteSession(session.sessionId);
    }
  }
};

export { cleanupSessions };
