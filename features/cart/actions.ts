"use server";
import { cookies } from "next/headers";
import { createCart } from "./db/cart";
import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/server";
import { addToCartService, decreaseQtyService } from "./service";
import { updateQtyService, getValidCartByUserId } from "./service";
import { increaseQtyService, removeFromCartService } from "./service";

const cookieOptions: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2] =
  {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 3,
    // maxAge: 180,
  };

// shared helper between actions
const getCartContext = async () => {
  const userId = await requireUser("/products");

  // get cart by user_id
  const userCart = await getValidCartByUserId(userId);

  const cookieStore = await cookies();
  if (!userCart) {
    const cartId = await createCart(userId, []);
    cookieStore.set("cart", cartId, cookieOptions);
    return { cartId, userId };
  }

  cookieStore.set("cart", userCart.id, cookieOptions);
  return { cartId: userCart.id, userId };
};

const addToCart = async (productId: string) => {
  try {
    const { cartId, userId } = await getCartContext();
    await addToCartService(userId, cartId, productId);

    // usualy isr refresh every 1h, so that is renew ui immediately
    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err; // allow redirect
    throw new Error("Failed to add item");
  }
};

const increaseQty = async (productId: string) => {
  try {
    const { cartId, userId } = await getCartContext();
    await increaseQtyService(userId, cartId, productId);

    revalidatePath("/products", "layout");
  } catch {
    throw new Error("increase qty failed");
  }
};

const decreaseQty = async (productId: string) => {
  try {
    const { cartId, userId } = await getCartContext();
    await decreaseQtyService(userId, cartId, productId);

    revalidatePath("/products", "layout");
  } catch {
    throw new Error("decrease qty failed");
  }
};

const removeFromCart = async (productId: string) => {
  try {
    const { cartId, userId } = await getCartContext();
    await removeFromCartService(userId, cartId, productId);

    revalidatePath("/products", "layout");
  } catch {
    throw new Error("remove from cart failed");
  }
};

const updateQty = async (productId: string, qty: number) => {
  const { cartId, userId } = await getCartContext();
  await updateQtyService(userId, cartId, productId, qty);

  revalidatePath("/products", "layout");
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
