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
import { Session } from "@/types/session";

const sessionsFilePath = path.join(process.cwd(), "lib/data/sessions.json");

// session crud helpers
const getSessions = async () => {
  const data = await fs.readFile(sessionsFilePath, "utf-8");
  return data === "" ? [] : JSON.parse(data);
};
const saveSessions = async (sessions: Array<Session>) => {
  await fs.writeFile(sessionsFilePath, JSON.stringify(sessions, null, 2));
};

// session crud
const getSession = async (sessionId: string) => {
  const sessions = await getSessions();
  return sessions.find((s: Session) => s.sessionId === sessionId);
};
const saveSession = async (session: Session) => {
  const sessions = await getSessions();
  sessions.push(session);
  await saveSessions(sessions);
  return session.sessionId;
};

const deleteSession = async (sessionId: string) => {
  const sessions = await getSessions();
  const newSessions = sessions.filter((s: Session) => s.sessionId !== sessionId);
  await saveSessions(newSessions);
};

export { getSession, saveSession, deleteSession };
