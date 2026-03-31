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
import { promises as fs } from "fs";

const sessionsFilePath = path.join(process.cwd(), "lib/data/sessions.json");

// session crud helpers
const getSessions = async () => {
  const data = await fs.readFile(sessionsFilePath, "utf-8");
  return data === "" ? [] : JSON.parse(data);
};
const saveSessions = async (sessions: any[]) => {
  await fs.writeFile(sessionsFilePath, JSON.stringify(sessions, null, 2));
};

// session crud
const getSession = async (sessionId: string) => {
  const sessions = await getSessions();
  return sessions.find((s: any) => s.sessionId === sessionId);
};
const saveSession = async (session: any) => {
  const sessions = await getSessions();
  sessions.push(session);
  await saveSessions(sessions);
  return session.sessionId;
};

const deleteSession = async (sessionId: string) => {
  const sessions = await getSessions();
  const newSessions = sessions.filter((s: any) => s.sessionId !== sessionId);
  await saveSessions(newSessions);
};

export { getSession, saveSession, deleteSession };
