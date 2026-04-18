// helpers (business logic)

import bcrypt from "bcrypt";
import { createSession } from "./session.helpers";
import { getUserByEmail, createUser } from "./repository/user";
import { saveSession, deleteSession } from "./repository/session";

// helpers
const comparePassword = async (
  plainPwd: string,
  hashedPwd: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPwd, hashedPwd);
};
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

// get user > check password > create session > return sessionId
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
  return { sessionId: session.sessionId };
};

const logout = async (sessionId: string) => {
  if (!sessionId) return;
  // hmm cookie also should removed
  await deleteSession(sessionId); // from db
};

// check if user exists > hash password > create user > return userId
const register = async (email: string, password: string, name: string) => {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("user already exists");
  }

  const hashedPassword = await hashPassword(password);
  const userData = {
    email,
    password: hashedPassword,
    name,
  };
  const userId = await createUser(userData);

  // create session
  const session = createSession(userId);
  await saveSession(session);

  return { sessionId: session.sessionId, userId };
};

export { login, register, logout };
