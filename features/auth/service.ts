// helpers (business logic)
import "server-only";

import { redis } from "@/lib/redis";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { createSession } from "./session.helpers";
import { getUserByEmail, createUser } from "./db/user";
import { saveSession, deleteSession } from "./db/session";

// helpers
const comparePassword = async (
  plainPwd: string,
  hashedPwd: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPwd, hashedPwd);
};
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};
const hashSessionId = (sessionId: string) => {
  return crypto.createHash("sha256").update(sessionId).digest("hex");
};

// get user > check password > create session > return sessionId
const login = async (email: string, password: string) => {
  const user = await getUserByEmail(email);

  if (!user) throw new Error("user not found");
  if (!(await comparePassword(password, user.password))) {
    throw new Error("invalid credentials");
  }

  // create session
  const session = createSession(user.id);
  const hashedSessionId = hashSessionId(session.sessionId);

  await saveSession({ ...session, sessionId: hashedSessionId });
  await redis.set(
    `session:${hashedSessionId}`,
    user.id,
    "EX",
    60 * 60 * 24 * 3, // 3 days
  );
  return { sessionId: session.sessionId };
};

// check if user exists > hash password > create user > return userId
const register = async (email: string, password: string, name: string) => {
  // check if email already exist
  const anyUser = await getUserByEmail(email);
  if (anyUser)
    throw new Error(
      "Unable to create account. Try logging in if you already registered.",
    );

  const hashedPassword = await hashPassword(password);
  const userData = { email, password: hashedPassword, name };

  const userId = await createUser(userData);
  if (!userId) throw new Error("Failed to create user");

  // create session
  const session = createSession(userId);
  const hashedSessionId = hashSessionId(session.sessionId);

  await saveSession({ ...session, sessionId: hashedSessionId });
  await redis.set(
    `session:${hashedSessionId}`,
    userId,
    "EX",
    60 * 60 * 24 * 3, // 3 days
  );

  return { sessionId: session.sessionId, userId };
};

const logout = async (sessionId: string) => {
  if (!sessionId) return;
  await deleteSession(hashSessionId(sessionId)); // from db
  await redis.del(`session:${hashSessionId(sessionId)}`);
};

export { login, register, logout, hashSessionId };
