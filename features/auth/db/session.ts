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
import { readFile, writeFile, mkdir, unlink } from "fs/promises";

// helpers
const deleteFile = async (path: string): Promise<boolean> => {
  try {
    await unlink(path);
    return true;
  } catch {
    return false; // file may not exist
  }
};

// create files
const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");
await mkdir(sessionsDir, { recursive: true });

// setup queues
type Task = () => Promise<any>;
const sessionQueues = new Map();

// chof mli tsali gol lgpt y3tik imgs bach tchof full flow

const appendToSessionQueue = async (session: Session, task: Task) => {
  const userQueue = sessionQueues.get(session.userId);
  if (userQueue) {
    // run appended usually crud
    const result = userQueue.nextQueue.then(task);
    const nextQueue = result.catch(() => {});
    let { userSessions } = userQueue;
    userSessions.set(session.sessionId, session)

    // remove unvalid sessions
    for (const session of userSessions) {
      const isValid = new Date(session.expiresAt) > new Date();
      if (!isValid) {
        const deleted = await deleteFile(
          path.join(
            process.cwd(),
            "storage",
            "auth",
            "sessions",
            `${session.sessionId}.json`,
          ),
        );
        if (deleted) {
          userSessions.filter((s) => s === session);
        }
      }
    }
    sessionQueues.set(session.userId, { userSessions, nextQueue });
    return result;
  } else {
    const result = Promise.resolve().then(task);
    const nextQueue = result.catch(() => {});
    const userSessions = new Map();

    userSessions.set(session.sessionId, session);
    sessionQueues.set(session.userId, { userSessions, nextQueue });
    return result;
  }
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
    const userPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "sessions",
      `${sessionId}.json`,
    );

    try {
      await unlink(userPath);
      return true;
    } catch {
      return false; // file may not exist
    }
  };
  return appendToSessionQueue(task);
};

const getUserIdBySessionId = async (
  sessionId: string,
): Promise<string | undefined> => {
  const session = await getSession(sessionId);
  return session?.userId;
};

export { getSession, saveSession, deleteSession, getUserIdBySessionId };
