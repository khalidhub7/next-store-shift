// in real production should update db here
// and cookies should store just cartId
/*
Client → addToCart(productId)
Server → read cartId cookie
Server → fetch cart from DB
Server → update cart
Server → save cart
*/

"use server";
import reloadCart from "@/lib/services/reloadCart";
import { CartItem } from "@/types/product";
import { revalidatePath } from "next/cache";
import { fetchProductById } from "@/lib/services/fetchProduct";

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
    let newCart: Array<CartItem>;
    const { appCookies, cart } = await reloadCart();
    const foundProduct = cart.find((i: CartItem) => i.id === productId);

    if (foundProduct) {
      newCart = cart.map((p: CartItem) => {
        return p.id === productId ? { ...p, qty: p.qty + 1 } : p;
      });
    } else {
      const { id, title, price } = await fetchProductById(productId);
      newCart = [...cart, { id, title, price, qty: 1 }];
    }

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
    // usualy isr refresh every 1h so that is renew it immediately
    revalidatePath("/products", "layout");
  };

  return appendToQueue(task);
};

const increaseQty = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")
    const { appCookies, cart } = await reloadCart();

    const newCart = cart.map((item: CartItem) =>
      item.id === productId ? { ...item, qty: item.qty + 1 } : item,
    );

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
    revalidatePath("/products", "layout");
  };

  return appendToQueue(task);
};

const decreaseQty = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")
    const { appCookies, cart } = await reloadCart();

    const newCart = cart
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item: CartItem) => item.qty > 0);

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
    revalidatePath("/products", "layout");
  };

  return appendToQueue(task);
};

const removeFromCart = async (productId: string) => {
  const task = async () => {
    // throw new Error("just for test")
    const { appCookies, cart } = await reloadCart();

    const newCart = cart.filter((item: CartItem) => item.id !== productId);

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
    revalidatePath("/products", "layout");
  };

  return appendToQueue(task);
};

const updateQty = async (productId: string, qty: number) => {
  const task = async () => {
    try {
      // throw new Error("test error"); // force fail for testing
      const { appCookies, cart } = await reloadCart();
      const newCart = cart.map((item: CartItem) =>
        item.id === productId ? { ...item, qty } : item,
      );

      appCookies.set("cart", JSON.stringify(newCart), {
        httpOnly: false,
        path: "/",
        maxAge: undefined,
      });
      revalidatePath("/products", "layout");
    } catch (err) {
      revalidatePath("/products", "layout");
      throw err;
    }
  };
  return appendToQueue(task);
};

export { addToCart, decreaseQty, removeFromCart, updateQty, increaseQty };
