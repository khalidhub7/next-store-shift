/* 

features/auth/db/
├── session.ts          (has "server-only") → for Next.js
├── session.script.ts   (no "server-only") → for scripts 

*/

import { getAllSessions, deleteSession } from "./session-core";
export { getAllSessions, deleteSession };
