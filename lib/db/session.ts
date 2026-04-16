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
import { Session } from "@/types/session";
import { readFile, writeFile } from "fs/promises";

const sessionsFilePath = path.join(
  process.cwd(),
  "lib",
  "data",
  "sessions.json",
);

type Task = () => Promise<any>;

let queue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  const result = queue.then(() => task());
  queue = result.catch(() => {});
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
    await cleanExpiredSessions();
    const data = await readFile(sessionsFilePath, "utf-8");
    return data === "" ? [] : JSON.parse(data);
  } catch {
    return [];
  }
};
const saveSessions = async (sessions: Array<Session>): Promise<void> => {
  try {
    await cleanExpiredSessions();
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

export { getSession, saveSession, deleteSession };
