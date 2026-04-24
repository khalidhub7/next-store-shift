import { getCart } from "./db/cart";
import { cookies } from "next/headers";
import { CartItem } from "./types/cart";
import { getSession } from "../auth/server";
import { hashSessionId } from "../auth/server";
import { isSessionValid } from "../auth/server";

const getCartItems = async (): Promise<Array<CartItem>> => {
  // get cookies
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart")?.value;
  const sessionId = cookieStore.get("sessionId")?.value;

  try {
    if (!sessionId || !cartId) throw new Error();

    const session = await getSession(hashSessionId(sessionId));
    const cart = await getCart(cartId);

    if (!session || !cart) throw new Error();
    if (!isSessionValid(session)) throw new Error();
    if (session.userId != cart.userId) throw new Error();
    return cart.items;
  } catch {
    return [];
  }
};

export { getCartItems };
