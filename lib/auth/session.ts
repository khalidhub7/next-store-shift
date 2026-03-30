import { randomUUID } from "crypto";

const CreateSession = (userId: string) => {
  const createdAt = new Date();

  const session = {
    session: {
      id: randomUUID(),
      userId,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(
        createdAt.getTime() + 1000 * 60 * 60 * 24 * 3,
      ).toISOString(),
    },
  };
};
