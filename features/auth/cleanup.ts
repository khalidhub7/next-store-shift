import { readdir } from "fs";
import path from "path";
import { getSession } from "./server";

const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");

const cleanupSessions = async () => {
  const files = await readdir(sessionsDir);

  for (const file of files) {
    const session = await getSession(file.replace(".json", ""));

    if (!session) continue;

    const expired = new Date(session.expiresAt) < new Date();

    const oldRevoked =
      session.revokedAt &&
      Date.now() - new Date(session.revokedAt).getTime() >
        90 * 24 * 60 * 60 * 1000;

    if (expired || oldRevoked) {
      await deleteSession(session.sessionId);
    }
  }
};
