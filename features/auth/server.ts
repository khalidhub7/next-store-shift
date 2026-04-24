// export server comps
export { requireUser } from "./guard";
export { getSession } from "./db/session";
export { hashSessionId } from "./service"
export { isSessionValid } from "./session.helpers";

/* 
hint:
'getSession' is low level func
rule: dont export low lvl func
so 'getSession' exported temporarily

in future i think the session should be fetched from redis
*/
