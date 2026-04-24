"use server";

import { requireUser } from "../auth/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCartByUserId, createCart } from "./db/cart";
import {
  addToCartService,
  decreaseQtyService,
  increaseQtyService,
  removeFromCartService,
  updateQtyService,
} from "./service";

const cookieOptions: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2] =
  {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    // maxAge: 60 * 60 * 24 * 3,
    maxAge: 180,
  };

// shared helper between actions
const getCartId = async () => {
  const userId = await requireUser("/products");

  // get cart by user_id
  const userCart = await getCartByUserId(userId);
  if (!userCart) {
    const cookieStore = await cookies();
    const cartId = await createCart(userId, []);
    cookieStore.set("cart", cartId, cookieOptions);
    return cartId;
  }
  return userCart.id;
};

const addToCart = async (productId: string) => {
  try {
    const cartId = await getCartId();
    await addToCartService(cartId, productId);

    // usualy isr refresh every 1h, so that is renew ui immediately
    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err; // allow redirect
    throw new Error("Failed to add item");
  }
};

const increaseQty = async (productId: string) => {
  try {
    const cartId = await getCartId();
    await increaseQtyService(cartId, productId);

    revalidatePath("/products", "layout");
  } catch {
    throw new Error("increase qty failed");
  }
};

const decreaseQty = async (productId: string) => {
  try {
    const cartId = await getCartId();
    await decreaseQtyService(cartId, productId);

    revalidatePath("/products", "layout");
  } catch {
    throw new Error("decrease qty failed");
  }
};

const removeFromCart = async (productId: string) => {
  try {
    const cartId = await getCartId();
    await removeFromCartService(cartId, productId);

    revalidatePath("/products", "layout");
  } catch {
    throw new Error("remove from cart failed");
  }
};

const updateQty = async (productId: string, qty: number) => {
  try {
    const cartId = await getCartId();
    await updateQtyService(cartId, productId, qty);

    revalidatePath("/products", "layout");
  } catch {
    throw new Error("update qty failed");
  }
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
