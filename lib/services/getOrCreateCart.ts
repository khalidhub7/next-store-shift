import { cookies } from "next/headers";
import { createCart } from "../db";

const getOrCreateCart = async () => {
  try {
    const cookieStore = await cookies();
    
    const cookieCart = cookieStore.get("cart");
    
    if (!cookieCart) {
      const newCartId = await createCart([]);

      cookieStore.set("cart", newCartId, {
        maxAge: 60 * 60 * 24 * 3,
      });
      console.log('here');
      
      return newCartId;
    }
    return cookieCart.value;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    throw new Error(`failed to get or create cart, err: ${message}`);
  }
};

export { getOrCreateCart };
