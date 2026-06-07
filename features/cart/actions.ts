"use server";
// import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/server";
import { appendToCartQueue } from "./db/cart";
import { addToCartService, decreaseQtyService } from "./service";
import { updateQtyService, getValidCartByUserId } from "./service";
import { increaseQtyService, removeFromCartService } from "./service";

/* const cookieOptions: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2] =
  {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 3,
    // maxAge: 180,
  }; */

// shared helper between actions

const currentUser = async () => {
  let userId = undefined;
  try {
    userId = await requireUser("/products");
  } catch (err: unknown) {
    // if (isRedirectError(err)) console.log(`*** ${err?.digest} ***`);
    if (
      err instanceof Error &&
      "digest" in err &&
      typeof err.digest === "string" &&
      err.digest.includes("NEXT_REDIRECT")
    ) {
      throw err; // allow redirect
    }
    userId = undefined;
  }
  return userId;
};

const addToCart = async (productId: number) => {
  const userId = await currentUser();
  if (!userId) throw new Error("Unauthorized");

  const task = async () => {
    try {
      const cart = await getValidCartByUserId(userId, false);
      await addToCartService(userId, cart, productId, false);

      // Products page is cached (ISR).
      // Revalidate now instead of waiting for the cache duration.
      revalidatePath("/products", "layout");
    } catch (err: unknown) {
      throw new Error("Failed to add item");
    }
  };
  return appendToCartQueue(userId, task);
};

const increaseQty = async (productId: number) => {
  const userId = await requireUser("/products");

  const task = async () => {
    try {
      const cart = await getValidCartByUserId(userId, false);
      await increaseQtyService(userId, cart, productId, false);

      revalidatePath("/products", "layout");
    } catch (err: unknown) {
      // console.log(`*** ${err?.digest} ***`);
      if (isRedirectError(err)) {
        throw err;
      } // allow redirect
      throw new Error("increase qty failed");
    }
  };
  return appendToCartQueue(userId, task);
};

const decreaseQty = async (productId: number) => {
  const userId = await requireUser("/products");

  const task = async () => {
    try {
      const cart = await getValidCartByUserId(userId, false);
      await decreaseQtyService(userId, cart, productId, false);

      revalidatePath("/products", "layout");
    } catch (err: unknown) {
      if (isRedirectError(err)) {
        throw err;
      } // allow redirect
      throw new Error("decrease qty failed");
    }
  };
  return appendToCartQueue(userId, task);
};

const removeFromCart = async (productId: number) => {
  const userId = await requireUser("/products");

  const task = async () => {
    try {
      const cart = await getValidCartByUserId(userId, false);
      await removeFromCartService(userId, cart, productId, false);

      revalidatePath("/products", "layout");
    } catch (err: unknown) {
      if (isRedirectError(err)) {
        throw err;
      } // allow redirect
      throw new Error("remove from cart failed");
    }
  };
  return appendToCartQueue(userId, task);
};

const updateQty = async (productId: number, qty: number) => {
  const userId = await requireUser("/products");

  const task = async () => {
    try {
      const cart = await getValidCartByUserId(userId, false);
      await updateQtyService(userId, cart, productId, qty, false);
      revalidatePath("/products", "layout");
    } catch (err: unknown) {
      if (isRedirectError(err)) {
        throw err;
      } // allow redirect
      throw new Error(err instanceof Error ? err.message : "update qty failed");
    }
  };
  return appendToCartQueue(userId, task);
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
