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
      return newCartId;
    }
    return cookieCart.value;
  } catch (_) {
    throw new Error("failed to get or create cart");
  }
};

export { getOrCreateCart };
