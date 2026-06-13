import "server-only";

import { CartItem } from "./types/cart";
import { getCurrentUserId } from "../auth/server";
import { getValidCartByUserId } from "./service";

const getCartItems = async (): Promise<{
  cartItems: Array<CartItem>;
  message: string;
}> => {
  // current user
  const userId = await getCurrentUserId();

  // items
  if (!userId) {
    return { cartItems: [], message: "Please log in to view your cart." };
  }
  const cart = await getValidCartByUserId(userId, true);
  if (cart.items.length === 0) {
    return { cartItems: [], message: "Your cart is empty." };
  }
  return { cartItems: cart.items, message: "Cart loaded successfully." };
};

export { getCartItems };
