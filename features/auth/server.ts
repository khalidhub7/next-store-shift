// export server comps
import "server-only";


export { hashSessionId } from "./service";
export { logoutAction } from "./actions";
export { cleanupSessions } from "./cleanup";
export { isSessionValid } from "./session.helpers";
export { requireUser, getCurrentUserId } from "./guard";
export { deleteSession, getAllSessions } from "./db/session";

/* 
hint:
'getSession' is low level func
rule: dont export low lvl func
so 'getSession' exported temporarily

in future i think the session should be fetched from redis
*/
