// helper (business logic)
// only business logic

import { deleteSession } from "../db/session";

const logout = async (sessionId: string) => {
  if (!sessionId) return;

  await deleteSession(sessionId); // from db
};

export { logout };
