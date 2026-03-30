import { randomUUID } from "crypto";

const CreateSession = (userId: string) => {
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

  // store session reference (cookies)

  // store session in db
};
