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

const cleanup = async (userSessions: Map<string, Session>) => {
  const now = Date.now();
  for (const [sessionId, session] of userSessions) {
    const isValid = new Date(session.expiresAt).getTime() > now;
    if (!isValid) {
      const deleted = await deleteFile(
        path.join(
          process.cwd(),
          "storage",
          "auth",
          "sessions",
          `${sessionId}.json`,
        ),
      );
      if (deleted) userSessions.delete(sessionId);
    }
  }
};

// create files
const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");
await mkdir(sessionsDir, { recursive: true });

// setup queues
type Task = () => Promise<any>;
const sessionQueues = new Map();

const appendToSessionQueue = async (session: Session, task: Task) => {
  const queue = sessionQueues.get(session.userId) ?? {
    userSessions: new Map<string, Session>(),
    nextQueue: Promise.resolve(),
  };

  const result = queue.nextQueue.then(async () => {
    queue.userSessions.set(session.sessionId, session);
    await task();
    await cleanup(queue.userSessions);
  });

  queue.nextQueue = result.catch(() => {});
  sessionQueues.set(session.userId, queue);

  return result;
};

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

const saveSession = async (session: Session): Promise<string> => {
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
  return appendToSessionQueue(session, task);
};

const deleteSession = async (session: Session): Promise<void> => {
  const task = async () => {
    const userPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "sessions",
      `${session.sessionId}.json`,
    );

    try {
      await unlink(userPath);
      return true;
    } catch {
      return false; // file may not exist
    }
  };
  return appendToSessionQueue(session, task);
};

const getUserIdBySessionId = async (
  sessionId: string,
): Promise<string | undefined> => {
  const session = await getSession(sessionId);
  return session?.userId;
};

export { getSession, saveSession, deleteSession, getUserIdBySessionId };
