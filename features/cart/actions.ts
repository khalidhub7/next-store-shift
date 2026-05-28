"use server";
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
const getCartContext = async () => {
  const userId = await requireUser("/products");
  const cart = await getValidCartByUserId(userId);

  const cookieStore = await cookies();
  cookieStore.set("cart", cart.id, cookieOptions);
  return { cartId: cart.id, userId };
};

const addToCart = async (productId: number) => {
  try {
    const { cartId, userId } = await getCartContext();
    await addToCartService(userId, cartId, productId);

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
    const { cartId, userId } = await getCartContext();
    await increaseQtyService(userId, cartId, productId);

    revalidatePath("/products", "layout");
  } catch (err: any) {
    // console.log(`*** ${err?.digest} ***`);
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error("increase qty failed");
  }
};

const decreaseQty = async (productId: number) => {
  try {
    const { cartId, userId } = await getCartContext();
    await decreaseQtyService(userId, cartId, productId);

    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error("decrease qty failed");
  }
};

const removeFromCart = async (productId: number) => {
  try {
    const { cartId, userId } = await getCartContext();
    await removeFromCartService(userId, cartId, productId);

    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error("remove from cart failed");
  }
};

const updateQty = async (productId: number, qty: number) => {
  try {
    const { cartId, userId } = await getCartContext();
    await updateQtyService(userId, cartId, productId, qty);
    revalidatePath("/products", "layout");
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    throw new Error(err instanceof Error ? err.message : "update qty failed");
  }
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
