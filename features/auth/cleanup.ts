/* why scalable

today:  cleanupSessions()
        -> file DB
later:  cleanupSessions()
        -> mySQL
*/

import path from "path";
import { readdir } from "fs/promises";
import { getSession } from "./server";
import { deleteSession } from "./db/session";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");

const cleanupSessions = async () => {
  // When moving to MySQL, you'll replace that part with a DB query.
  const sessions = await readdir(sessionsDir);

  for (const session of sessions) {
    const sessionId = session.replace(".json", "");

    const sessionObj = await getSession(sessionId);

    if (!sessionObj) continue;

    const oldRevoked =
      sessionObj.revokedAt &&
      Date.now() - new Date(sessionObj.revokedAt).getTime() > SESSION_TTL_MS;

    if (oldRevoked) {
      await deleteSession(sessionObj.sessionId);
    }
  }
};

export { cleanupSessions };
