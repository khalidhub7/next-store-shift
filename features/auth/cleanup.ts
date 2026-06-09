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

const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");

const cleanupSessions = async () => {
  const sessions = await readdir(sessionsDir);

  for (const session of sessions) {
    const sessionId = session.replace(".json", "");

    const sessionObj = await getSession(sessionId);

    if (!sessionObj) continue;

    const expired = new Date(sessionObj.expiresAt) < new Date();
    const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

    const oldRevoked =
      sessionObj.revokedAt &&
      Date.now() - new Date(sessionObj.revokedAt).getTime() > SESSION_TTL_MS;

    if (expired || oldRevoked) {
      await deleteSession(sessionObj.sessionId);
    }
  }
};
