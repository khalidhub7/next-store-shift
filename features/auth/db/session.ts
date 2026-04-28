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
    const result = userQueue.nextQueue.then(task);
    const nextQueue = result.catch(() => {});
    const { userSessions } = userQueue;

    /*
    {
        "sessionId": "c1f3a9e2-7b4d-4a6f-9d2e-123456789abc",
        "userId": "user123",
        "createdAt": "2026-04-28T10:00:00.000Z",
        "expiresAt": "2026-04-28T10:01:00.000Z"
    }
    */

    for (const session of userSessions) {
      const isValid = new Date(session.expiresAt) > new Date();
      if (!isValid) {
        const deleted = deleteFile(
          path.join(
            process.cwd(),
            "storage",
            "auth",
            "sessions",
            `${session.sessionId}.json`,
          ),
        );
      }
    }
  }

  const nextQueue = result.catch(() => {});
  const userSessions = [];
  const userQueueState = {
    nextQueue,
    userSessions,
  };

  sessionQueues.set(session.userId, nextQueue);
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
