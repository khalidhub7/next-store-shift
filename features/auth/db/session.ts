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
await mkdir(sessionsDir, { recursive: true });
const userSessionsIndexPath = path.join(
  process.cwd(),
  "storage",
  "auth",
  "userSessionsIndex.json",
);
try {
  await access(userSessionsIndexPath);
} catch {
  await writeFile(userSessionsIndexPath, "{}");
}

// setup queues
type Task = () => Promise<any>;
type UserSessionsIndex = Record<string, string[]>;

const sessionQueues = new Map();
// ensures user stays unique (lock)
let userSessionsIndexQueue = Promise.resolve();

const appendToSessionQueue = async (userId: string, task: Task) => {
  const queue = sessionQueues.get(userId) || Promise.resolve();

  const result = queue.then(task);
  sessionQueues.set(
    userId,
    result.catch(() => {}),
  );

  return result;
};
const appendToUserSessionsIndexQueue = async (task: Task) => {
  const result = userSessionsIndexQueue.then(() => task());
  userSessionsIndexQueue = result.catch(() => {});
  return result;
};

// userSessionsIndex.json crud

const getUserSessionsIndex = async (): Promise<UserSessionsIndex> => {
  try {
    const users = await readFile(userSessionsIndexPath, "utf-8");
    return JSON.parse(users);
  } catch {
    return {} as UserSessionsIndex;
  }
};

const saveUserSessionsIndex = async (
  users: UserSessionsIndex,
): Promise<void> => {
  try {
    await writeFile(userSessionsIndexPath, JSON.stringify(users, null, 2));
  } catch (err) {
    throw err;
  }
};

const setUserSessionsIndexEntry = async (userId: string, sessionId: string) => {
  const task = async () => {
    try {
      const data = await getUserSessionsIndex();
      const sessions = data[userId] ?? [];
      await saveUserSessionsIndex({
        ...data,
        [userId]: [...sessions, sessionId],
      });
      return true;
    } catch {
      return false;
    }
  };
  return appendToUserSessionsIndexQueue(task);
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
