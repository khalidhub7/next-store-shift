import { randomUUID } from "crypto";

const CreateSessionObj = (userId: string) => {
  // session
  const createdAt = new Date();
  const session = {
    sessionId: randomUUID(),
    data: {
      userId,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(
        createdAt.getTime() + 1000 * 60 * 60 * 24 * 3, // 3 days
      ).toISOString(),
    },
  };
  return session;
};


export { CreateSessionObj }

// not complete yet