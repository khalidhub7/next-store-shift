interface Session {
  userId: string;
  revoked?: boolean;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
}

export type { Session };