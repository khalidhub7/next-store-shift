"use server";
// import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateQtyService } from "./service";
import { requireUser } from "../auth/server";
import { appendToCartQueue } from "./db/cart";
import { addToCartService, decreaseQtyService } from "./service";
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

const currentUser = async (): Promise<string | undefined> => {
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
    // later for debugging don't hide errors
    userId = undefined;
  }
  return userId;
};

const addToCart = async (productId: number) => {
  const userId = await currentUser();
  if (!userId) throw new Error("Please sign in to continue");

  try {
    await addToCartService(userId, productId);
    // Products page is cached (ISR).
    // Revalidate now instead of waiting for the cache duration.
    revalidatePath("/products", "layout");
  } catch {
    throw new Error("Failed to add item");
  }
};

const increaseQty = async (productId: number) => {
  const userId = await currentUser();
  if (!userId) throw new Error("Please sign in to continue");

  const task = async () => {
    try {
      await increaseQtyService(userId, productId);
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("Failed to increase quantity");
    }
  };
  return appendToCartQueue(userId, task);
};

const decreaseQty = async (productId: number) => {
  const userId = await currentUser();
  if (!userId) throw new Error("Please sign in to continue");

  const task = async () => {
    try {
      await decreaseQtyService(userId, productId);
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("Failed to decrease quantity");
    }
  };
  return appendToCartQueue(userId, task);
};

const removeFromCart = async (productId: number) => {
  const userId = await currentUser();
  if (!userId) throw new Error("Please sign in to continue");

  const task = async () => {
    try {
      await removeFromCartService(userId, productId);
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("Failed to remove item");
    }
  };
  return appendToCartQueue(userId, task);
};

const updateQty = async (productId: number, qty: number) => {
  const userId = await currentUser();
  if (!userId) throw new Error("Please sign in to continue");

  const task = async () => {
    try {
      await updateQtyService(userId, productId, qty);
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("Failed to update quantity");
    }
  };
  return appendToCartQueue(userId, task);
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
