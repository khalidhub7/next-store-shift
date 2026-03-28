"use server";

import { CartItem } from "@/types/product";
import { revalidatePath } from "next/cache";
import { getCartById, updateCart, deleteCart } from "@/lib/db";
import { fetchProductById } from "@/lib/services/fetchProduct";
import { getOrCreateCart } from "@/lib/services/getOrCreateCart";

type Task = () => Promise<void>;

// help to avoid race conditions
let resolveActionsQueue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  const result = resolveActionsQueue.then(() => task()); // run task after queue
  resolveActionsQueue = result.catch(() => {}); // queue never dies
  return result; // caller gets the real error
};

const addToCart = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")
    try {
      let newCart: Array<CartItem>;
      const cartId = await getOrCreateCart(); // from cookie
      const cart = await getCartById(cartId); // from db

      // update cart in db
      const productInCart = cart.find((i: CartItem) => i.id === productId);
      if (productInCart) {
        newCart = cart.map((p: CartItem) => {
          return p.id === productId ? { ...p, qty: p.qty + 1 } : p;
        });
      } else {
        const { id, title, price } = await fetchProductById(productId);
        newCart = [...cart, { id, title, price, qty: 1 }];
      }
      await updateCart(cartId, newCart);

      // usualy isr refresh every 1h, so that is renew ui immediately
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("add to cart failed");
    }
  };

  return appendToQueue(task);
};

const increaseQty = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")

    try {
      let newCart: Array<CartItem>;
      const cartId = await getOrCreateCart();
      const cart = await getCartById(cartId);

      newCart = cart.map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      );
      await updateCart(cartId, newCart); // update db
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("increase qty failed");
    }
  };

  return appendToQueue(task);
};

const decreaseQty = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")

    try {
      let newCart: Array<CartItem>;
      const cartId = await getOrCreateCart();
      const cart = await getCartById(cartId);

      newCart = cart
        .map((item: CartItem) =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter((item: CartItem) => item.qty > 0);

      await updateCart(cartId, newCart);
      revalidatePath("/products", "layout");
    } catch {
      throw new Error("decrease qty failed");
    }
  };

  return appendToQueue(task);
};

const removeFromCart = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")

    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getOrCreateCart();
      const cart = await getCartById(cartId);

      newCartItems = cart.items.filter((i: CartItem) => i.id !== productId);

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
      let newCart: Array<CartItem>;
      const cartId = await getOrCreateCart();
      const cart = await getCartById(cartId);

      newCart = cart.map((item: CartItem) =>
        item.id === productId ? { ...item, qty } : item,
      );
      await updateCart(productId, newCart);

      revalidatePath("/products", "layout");
    } catch {
      throw new Error("update qty failed");
    }
  };
  return appendToQueue(task);
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
