interface Session {
  userId: string;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export type { Session };
