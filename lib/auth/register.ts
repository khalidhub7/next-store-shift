// helper (business logic)

/*
check if user exists
hash password
create user
return userId
*/

import bcrypt from "bcrypt";
import { createSession } from "./session";
import { saveSession } from "../db/session";
import { createUser, getUserByEmail } from "../db/user";

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

const register = async (email: string, password: string) => {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("user already exists");
  }

  const hashedPassword = await hashPassword(password);

  const userId = await createUser({
    email,
    password: hashedPassword,
  });

  // create session
  const session = createSession(userId);
  await saveSession(session);

  return { sessionId: session.sessionId, userId };
};

export { register };
