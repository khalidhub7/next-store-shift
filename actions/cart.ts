"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types/cart";
import { revalidatePath } from "next/cache";
import { getCartByUserId } from "@/lib/db/cart";
import { cookieOptions } from "@/lib/auth/cookie";
import { requireUser } from "@/lib/auth/requireUser";
import { getCart, updateCart, createCart } from "@/lib/db/cart";
import { fetchProductById } from "@/lib/services/fetchProduct";


type Task = () => Promise<void>;


// help to avoid race conditions
let resolveActionsQueue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  // run task after queue
  const result = resolveActionsQueue.then(() => task());
  // queue never dies
  resolveActionsQueue = result.catch(() => {});
  // caller gets the real error
  return result;
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
  const task = async () => {
    // throw new Error("test error")
    try {
      let newCartItems: Array<CartItem>;

      const cartId = await getCartId();
      const cart = await getCart(cartId);

      if (!cart) throw new Error("Cart not found");

      const { items: cartItems } = cart;

      // update cart in db
      const productInCart = cartItems.find((i: CartItem) => i.id === productId);

      if (productInCart) {
        newCartItems = cartItems.map((p: CartItem) => {
          return p.id === productId ? { ...p, qty: p.qty + 1 } : p;
        });
      } else {
        const { id, title, price } = await fetchProductById(productId);
        newCartItems = [...cartItems, { id, title, price, qty: 1 }];
      }

      await updateCart(cartId, newCartItems);

      // usualy isr refresh every 1h, so that is renew ui immediately
      revalidatePath("/products", "layout");
    } catch (err: any) {
      if (err?.digest?.includes("NEXT_REDIRECT")) throw err; // allow redirect
      throw new Error("Failed to add item");
    }
  };

  return appendToQueue(task);
};

const increaseQty = async (productId: string) => {
  const task = async () => {
    // throw new Error("test error")

    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId();
      const cart = await getCart(cartId);

      if (!cart) throw new Error("Cart not found");

      const { items: cartItems } = cart;

      newCartItems = cartItems.map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      );

      await updateCart(cartId, newCartItems); // update db
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("increase qty failed");
    }
  };

  return appendToQueue(task);
};

const decreaseQty = async (productId: string) => {
  const task = async () => {
    // throw new Error("test error")

    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId();
      const cart = await getCart(cartId);

      if (!cart) throw new Error("Cart not found");

      const { items: cartItems } = cart;

      newCartItems = cartItems
        .map((item: CartItem) =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter((item: CartItem) => item.qty > 0);

      await updateCart(cartId, newCartItems);
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("decrease qty failed");
    }
  };

  return appendToQueue(task);
};

const removeFromCart = async (productId: string) => {
  const task = async () => {
    // throw new Error("test error")

    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId();
      const cart = await getCart(cartId);

      if (!cart) throw new Error("Cart not found");

      const { items: cartItems } = cart;

      newCartItems = cartItems.filter((i: CartItem) => i.id !== productId);

      await updateCart(cartId, newCartItems);

      revalidatePath("/products", "layout");
    } catch {
      throw new Error("remove from cart failed");
    }
  };

  return appendToQueue(task);
};

const updateQty = async (productId: string, qty: number) => {
  const task = async () => {
    // throw new Error("test error"); // force fail for testing
    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId();

      const cart = await getCart(cartId);
      if (!cart) throw new Error("Cart not found");

      const { items: cartItems } = cart;

      newCartItems = cartItems
        .map((item: CartItem) =>
          item.id === productId ? { ...item, qty } : item,
        )
        .filter((item: CartItem) => item.qty > 0);
      await updateCart(cartId, newCartItems);

      revalidatePath("/products", "layout");
    } catch {
      throw new Error("update qty failed");
    }
  };
  return appendToQueue(task);
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
