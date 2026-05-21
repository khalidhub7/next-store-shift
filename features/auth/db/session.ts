/* db access layer */
/* idea

Now (fake DB)
storage/auth/sessions & userSessions = source of truth
db/session.ts = reads/writes files

Later (real DB)
DELETE storage/ folder
db/session.ts → connects to real DB
*/

import path from "path";
import { Session } from "../types/session";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";

// helpers

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
  const safeResult = result.catch(() => {});

  sessionQueues.set(sessionId, safeResult);
  safeResult.finally(() => {
    if (sessionQueues.get(sessionId) === safeResult)
      sessionQueues.delete(sessionId);
  });
  return result;
};

const appendToUserSessionsQueue = async (userId: string, task: Task) => {
  const queue = userSessionsQueue.get(userId) || Promise.resolve();

  const result = queue.then(task);
  const safeResult = result.catch(() => {});

  userSessionsQueue.set(userId, safeResult);
  safeResult.finally(() => {
    if (userSessionsQueue.get(userId) === safeResult)
      userSessionsQueue.delete(userId);
  });
  return result;
};

// userSessions crud

const getUserSessions = async (
  userId: string,
  useQueue: boolean = true,
): Promise<Array<string>> => {
  const task = async () => {
    const filePath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "userSessions",
      `${userId}.json`,
    );
    const userSessions = await readFile(filePath, "utf-8");
    return JSON.parse(userSessions);
  };
  return useQueue ? appendToUserSessionsQueue(userId, task) : task();
};

const saveUserSessions = async (
  userId: string,
  sessions: Array<string>,
  useQueue: boolean = true,
): Promise<void> => {
  const task = async () => {
    const filePath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "userSessions",
      `${userId}.json`,
    );
    await writeFile(filePath, JSON.stringify(sessions, null, 2));
  };
  return useQueue ? appendToUserSessionsQueue(userId, task) : task();
};

const addUserSessionsEntry = async (
  userId: string,
  sessionId: string,
  useQueue: boolean = true,
) => {
  const task = async () => {
    const sessions = await getUserSessions(userId, false);
    const newSessions = [...sessions, sessionId];
    await saveUserSessions(userId, newSessions, false);
  };
  return useQueue ? appendToUserSessionsQueue(userId, task) : task();
};

const deleteUserSessionsEntry = async (
  userId: string,
  sessionId: string,
  useQueue: boolean = true,
) => {
  const task = async () => {
    const sessions = await getUserSessions(userId, false);
    const updatedSessions = sessions.filter((id) => id !== sessionId);
    await saveUserSessions(userId, updatedSessions, false);
  };
  return useQueue ? appendToUserSessionsQueue(userId, task) : task();
};

// session crud

const getSession = async (
  sessionId: string,
  useQueue: boolean = true,
): Promise<Session | undefined> => {
  const task = async () => {
    const sessionPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "sessions",
      `${sessionId}.json`,
    );
    const data = await readFile(sessionPath, "utf-8");
    return JSON.parse(data) as Session;
  };
  return useQueue ? appendToSessionQueue(sessionId, task) : task();
};

const getUserIdBySessionId = async (
  sessionId: string,
  useQueue: boolean = true,
): Promise<string | undefined> => {
  const session = await getSession(sessionId, useQueue);
  return session?.userId;
};

const saveSession = async (
  session: Session,
  useQueue: boolean = true,
): Promise<string | false> => {
  const task = async () => {
    /* await cleanExpiredSessions(); */
    const sessionPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "sessions",
      `${session.sessionId}.json`,
    );
    await writeFile(sessionPath, JSON.stringify(session, null, 2));
    await addUserSessionsEntry(session.userId, session.sessionId).catch(
      async (err) => {
        await unlink(sessionPath).catch(() => {});
        throw err; // original error
      },
    );
    return session.sessionId;
  };
  return useQueue ? appendToSessionQueue(session.sessionId, task) : task();
};

const deleteSession = async (
  sessionId: string,
  useQueue: boolean = true,
): Promise<any> => {
  const task = async () => {
    const filePath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "sessions",
      `${sessionId}.json`,
    );

    const userId = await getUserIdBySessionId(sessionId, false);
    if (!userId) return; // Logout/delete should succeed even if already deleted.

    // Delete file
    await Promise.all([
      unlink(filePath).catch(() => {
        throw new Error("Delete failed");
      }),
      deleteUserSessionsEntry(userId, sessionId).catch(() => {
        throw new Error("Delete failed");
      }),
    ]);
  };
  return useQueue ? appendToSessionQueue(sessionId, task) : task();
};

export { getSession, saveSession, deleteSession, getUserIdBySessionId };
