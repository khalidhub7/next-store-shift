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
import { readFile, writeFile, mkdir, unlink, access } from "fs/promises";

// helpers
const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await unlink(filePath);
    return true;
  } catch {
    return false; // file may not exist
  }
};

// create files
const sessionsDir = path.join(process.cwd(), "storage", "auth", "sessions");

const userSessionsDir = path.join(
  process.cwd(),
  "storage",
  "auth",
  "userSessions",
);

await mkdir(sessionsDir, { recursive: true });
await mkdir(userSessionsDir, { recursive: true });

// types
type Task = () => Promise<any>;

// setup queues
const sessionQueues = new Map(); // ensure session queues ordered
const userSessionsQueue = new Map(); // ensure userSessions queues ordered

const appendToSessionQueue = async (sessionId: string, task: Task) => {
  const queue = sessionQueues.get(sessionId) || Promise.resolve();

  const result = queue.then(task);

  sessionQueues.set(
    sessionId,
    result.catch(() => {}),
  );

  return result;
};
const appendToUserSessionsQueue = async (userId: string, task: Task) => {
  const queue = userSessionsQueue.get(userId) || Promise.resolve();

  const result = queue.then(task);

  userSessionsQueue.set(
    userId,
    result.catch(() => {}),
  );

  return result;
};

// userSessions crud

const getUserSessions = async (userId: string): Promise<Array<string>> => {
  try {
    const filePath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "userSessions",
      `${userId}.json`,
    );
    const userSessions = await readFile(filePath, "utf-8");
    return JSON.parse(userSessions);
  } catch {
    return [];
  }
};

const saveUserSessions = async (
  userId: string,
  sessions: Array<string>,
): Promise<void> => {
  try {
    const filePath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "userSessions",
      `${userId}.json`,
    );
    await writeFile(filePath, JSON.stringify(sessions, null, 2));
  } catch (err) {
    throw err;
  }
};

const setUserSessionsEntry = async (userId: string, sessionId: string) => {
  const task = async () => {
    try {
      const sessions = await getUserSessions(userId);
      const newSessions = [...sessions, sessionId];
      await saveUserSessions(userId, newSessions);
      return true;
    } catch {
      return false;
    }
  };
  return appendToUserSessionsQueue(userId, task);
};

// session crud

const getUserIdBySessionId = async (
  sessionId: string,
): Promise<string | undefined> => {
  const session = await getSession(sessionId);
  return session?.userId;
};

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
      return JSON.parse(data) as Session;
    } catch {
      return undefined;
    }
  };
  return appendToSessionQueue(sessionId, task);
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
