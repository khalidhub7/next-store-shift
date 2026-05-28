"use server";
import { Cart } from "./types/cart";
import { cookies } from "next/headers";
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
const getCartContext = async (): Promise<{ userId: string; cart: Cart }> => {
  const userId = await requireUser("/products");
  const cart = await getValidCartByUserId(userId);

  const cookieStore = await cookies();
  cookieStore.set("cart", cart.id, cookieOptions);
  return { userId, cart };
};

const addToCart = async (productId: number) => {
  try {
    const { userId, cart } = await getCartContext();
    await addToCartService(userId, cart, productId);

    // usualy isr refresh every 1h, so that is renew ui immediately
    revalidatePath("/products", "layout");
  } catch (err: any) {
    /* if (err?.digest?.includes("NEXT_REDIRECT"))
      console.log(`*** ${err?.digest} ***`); */
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err; // allow redirect
    throw new Error("Failed to add item");
  }
};

const increaseQty = async (productId: number) => {
  try {
    const { userId, cart } = await getCartContext();
    await increaseQtyService(userId, cart, productId);

    revalidatePath("/products", "layout");
  } catch (err: any) {
    // console.log(`*** ${err?.digest} ***`);
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error("increase qty failed");
  }
};

const decreaseQty = async (productId: number) => {
  try {
    const { userId, cart } = await getCartContext();
    await decreaseQtyService(userId, cart, productId);

    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error("decrease qty failed");
  }
};

const removeFromCart = async (productId: number) => {
  try {
    const { userId, cart } = await getCartContext();
    await removeFromCartService(userId, cart, productId);

    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error("remove from cart failed");
  }
};

const updateQty = async (productId: number, qty: number) => {
  try {
    const { userId, cart } = await getCartContext();
    await updateQtyService(userId, cart, productId, qty);
    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error(err instanceof Error ? err.message : "update qty failed");
  }
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
