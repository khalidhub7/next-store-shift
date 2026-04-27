/* db access layer */
/* idea

Now (fake DB)
data/*.json = source of truth
db.ts = reads/writes files

Later (real DB)
DELETE data/ folder
db.ts → connects to real DB
*/
import path from "path";
import { Session } from "../types/session";
import { readFile, writeFile, mkdir } from "fs/promises";

// create files
const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");
await mkdir(sessionsDir, { recursive: true });

// setup queues
type Task = () => Promise<any>;
const sessionQueues = new Map();
const appendToSessionQueue = async (sessionId: string, task: Task) => {
  const queue = sessionQueues.get(sessionId) || Promise.resolve();

  const result = queue.then(task);
  sessionQueues.set(
    sessionId,
    result.catch(() => {}),
  );
  return result;
};

// session crud helpers
/* const cleanExpiredSessions = async () => {
  const sessions = await getSessions();
  const now = Date.now();

  const valid = sessions.filter((s) => new Date(s.expiresAt).getTime() > now);

  await saveSessions(valid);
}; */

// session crud
const getSession = async (sessionId: string): Promise<Session | undefined> => {
  const task = async () => {
    try {
      const sessionPath = path.join(
        process.cwd(),
        "storage",
        "auth",
        "sessions",
        `${sessionId}.json`,
      );

      const data = await readFile(sessionPath, "utf-8");
      const session = JSON.parse(data);
      return session as Session;
    } catch {
      return undefined;
    }
  };
  return task();
};

const writeSession = async (session: Session): Promise<string> => {
  const task = async () => {
    /* await cleanExpiredSessions(); */
    try {
      const sessionPath = path.join(
        process.cwd(),
        "storage",
        "auth",
        "users",
        `${session.sessionId}.json`,
      );
      await writeFile(sessionPath, JSON.stringify(session, null, 2));
      return session.sessionId;
    } catch {
      return false;
    }
  };
  return appendToSessionQueue(session.sessionId, task);
};

const deleteSession = async (sessionId: string): Promise<void> => {
  const task = async () => {
    const sessions = await getSessions();
    const newSessions = sessions.filter(
      (s: Session) => s.sessionId !== sessionId,
    );
    await saveSessions(newSessions);
  };
  return appendToQueue(task);
};

const getUserIdBySessionId = async (
  sessionId: string,
): Promise<string | undefined> => {
  const session = await getSession(sessionId);
  return session?.userId;
};

export { getSession, saveSession, deleteSession, getUserIdBySessionId };
