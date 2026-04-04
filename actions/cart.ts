"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types/product";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/requireUser";
import { getCart, updateCart, createCart } from "@/lib/db/cart";
import { fetchProductById } from "@/lib/services/fetchProduct";

type Task = () => Promise<void>;

const cookieOptions: any = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 3
}

// help to avoid race conditions
let resolveActionsQueue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  const result = resolveActionsQueue.then(() => task()); // run task after queue
  resolveActionsQueue = result.catch(() => {}); // queue never dies
  return result; // caller gets the real error
};

// shared helper between actions
const getCartId = async () => {
  const userId =  await requireUser();

  const cookieStore = await cookies();
  const cookieCart = cookieStore.get("cart");
  let cartId = cookieCart?.value;
  if (!cartId) {
    cartId = await createCart(userId, []);
    cookieStore.set("cart", cartId, cookieOptions);
  }
  return cartId;
};

const addToCart = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")
    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId(); // from cookie

      const { items: cartItems } = await getCart(cartId); // from db

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
      throw new Error(`add to cart failed err: ${err.message}`);
    }
  };

  return appendToQueue(task);
};

const increaseQty = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")

    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId();
      const { items: cartItems } = await getCart(cartId);

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
    // throw new Error("just for test")

    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId();
      const { items: cartItems } = await getCart(cartId);

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
    // throw new Error("just for test")

    try {
      let newCartItems: Array<CartItem>;
      const cartId = await getCartId();
      const { items: cartItems } = await getCart(cartId);

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
      const { items: cartItems } = await getCart(cartId);

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
