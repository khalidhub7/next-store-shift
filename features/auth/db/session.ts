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
const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await unlink(filePath);
    return true;
  } catch {
    return false; // file may not exist
  }
};

const cleanup = async (userSessions: Map<string, Session>) => {
  const now = Date.now();
  const expired = [...userSessions.entries()].filter(
    ([, session]) => new Date(session.expiresAt).getTime() <= now,
  );

  for (const [sessionId] of expired) {
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
};

// create files
const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");
await mkdir(sessionsDir, { recursive: true });

// setup queues
type Task = () => Promise<any>;
const sessionQueues = new Map();

type QueueOptions = {
  sessionId: string;
  task: Task;
  session?: Session; // only for write
};

const appendToSessionQueue = async (options: QueueOptions) => {
  const mode = options.session ? "write" : "read";
  const sessionId = options.sessionId;
  const session = options.session;

  const queue = sessionQueues.get(userId) ?? {
    userSessions: new Map<string, Session>(),
    nextQueue: Promise.resolve(),
  };

  const result = queue.nextQueue.then(async () => {
    mode === "write" && queue.userSessions.set(sessionId, session);
    await options.task();
    mode === "write" && (await cleanup(queue.userSessions));
  });

  queue.nextQueue = result.catch(() => {});
  sessionQueues.set(userId, queue);

  return result;
};

// session crud

const getUserIdBySessionId = async (
  sessionId: string,
): Promise<string | undefined> => {
  const session = await getSession(sessionId);
  return session?.userId;
};

const getSession = async (sessionId: Session): Promise<Session | undefined> => {
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
      return JSON.parse(data) as Session;
    } catch {
      return undefined;
    }
  };
  return appendToSessionQueue();
};

const saveSession = async (session: Session): Promise<string> => {
  const task = async () => {
    /* await cleanExpiredSessions(); */
    try {
      const sessionPath = path.join(
        process.cwd(),
        "storage",
        "auth",
        "sessions",
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

export { getSession, saveSession, deleteSession, getUserIdBySessionId };
