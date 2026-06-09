// export server comps
import "server-only";

export { requireUser } from "./guard";
export { deleteSession, getAllSessions } from "./db/session";
export { hashSessionId } from "./service";
export { isSessionValid } from "./session.helpers";
export { cleanupSessions } from "./cleanup";

export { logoutAction } from "./actions";

/* 
hint:
'getSession' is low level func
rule: dont export low lvl func
so 'getSession' exported temporarily

in future i think the session should be fetched from redis
*/
