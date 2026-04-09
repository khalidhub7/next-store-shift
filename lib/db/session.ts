/* db access layer */
/* idea

Now (fake DB)
data/*.json = source of truth
db.ts = reads/writes files

Later (real DB)
DELETE data/ folder
db.ts → connects to real DB
*/
import { fileURLToPath } from "url";
import { Session } from "@/types/session";
import { readFile, writeFile } from "fs/promises";

const sessionsFilePath = fileURLToPath(
  new URL("../data/sessions.json", import.meta.url),
);

type Task = () => Promise<any>;

let queue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  const result = queue.then(() => task());
  queue = result.catch(() => {});
  return result;
};

// session crud helpers
const getSessions = async () => {
  const data = await readFile(sessionsFilePath, "utf-8");
  return data === "" ? [] : JSON.parse(data);
};
const saveSessions = async (sessions: Array<Session>) => {
  await writeFile(sessionsFilePath, JSON.stringify(sessions, null, 2));
};

// session crud
const getSession = async (sessionId: string) => {
  const sessions = await getSessions();
  return sessions.find((s: Session) => s.sessionId === sessionId);
};
const saveSession = async (session: Session) => {
  const task = async () => {
    const sessions = await getSessions();
    sessions.push(session);
    await saveSessions(sessions);
    return session.sessionId;
  };

  return appendToQueue(task);
};

const deleteSession = async (sessionId: string) => {
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
