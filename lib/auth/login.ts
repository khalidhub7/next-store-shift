// helper (business logic)

/* 
get user
check password
create session 
return sessionId
*/

import bcrypt from "bcrypt";
import { createSession } from "./session";
import { saveSession } from "../db/session";
import { getUserByEmail } from "../db/user";

// helper (i think used just in that file)
const comparePassword = async (
  plainPwd: string,
  hashedPwd: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPwd, hashedPwd);
};

const login = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("user not found");
  }
  if (!(await comparePassword(password, user.password))) {
    throw new Error("invalid credentials");
  }

  // create session
  const session = createSession(user.id);
  await saveSession(session);

  // later in action/* set cookie

  return { sessionId: session.sessionId };
};

export { login };
