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
const cleanExpiredSessions = async () => {
  const sessions = await getSessions();
  const now = Date.now();

  const valid = sessions.filter((s) => new Date(s.expiresAt).getTime() > now);

  await saveSessions(valid);
};
const getSessions = async (): Promise<Array<Session>> => {
  try {
    const data = await readFile(sessionsFilePath, "utf-8");
    return data === "" ? [] : JSON.parse(data);
  } catch {
    return [];
  }
};
const saveSessions = async (sessions: Array<Session>): Promise<void> => {
  try {
    await writeFile(sessionsFilePath, JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.log("Failed to write to sessions.json");
    throw err;
  }
};

// session crud
const getSession = async (sessionId: string): Promise<Session | undefined> => {
  const sessions = await getSessions();
  return sessions.find((s: Session) => s.sessionId === sessionId);
};

const saveSession = async (session: Session): Promise<string> => {
  const task = async () => {
    await cleanExpiredSessions();
    const sessions = await getSessions();
    sessions.push(session);
    await saveSessions(sessions);
    return session.sessionId;
  };
  return appendToQueue(task);
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
