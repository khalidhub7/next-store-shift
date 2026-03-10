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

import { toast } from "sonner";
import { cookies } from "next/headers";
import { Product } from "@/types/product";

interface CartItem {
  id: number;
  title: string;
  price: number;
  qty: number;
}
type Task = () => Promise<void>;

// help to avoid race conditions
let resolveActionsQueue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  resolveActionsQueue = resolveActionsQueue
    .then(() => task())
    .catch(() => undefined);
  return resolveActionsQueue;
};

const reloadCart = async () => {
  // return the appCookies + cart
  const appCookies = await cookies();
  const request = appCookies.get("cart");
  const cart = request ? JSON.parse(request.value) : [];
  return { cart, appCookies };
};

const addToCart = async (product: Product) => {
  const task = async () => {
    let newCart: Array<CartItem>;
    const { appCookies, cart } = await reloadCart();
    const isExist = cart.find((i: CartItem) => i.id === product.id);

    if (isExist) {
      newCart = cart.map((p: CartItem) => {
        const { id, title, price, qty } = isExist;
        return p.id === id ? { id, title, price, qty: qty + 1 } : p;
      });
    } else {
      const { id, title, price } = product;
      newCart = [...cart, { id, title, price, qty: 1 }];
    }

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
  };

  return appendToQueue(task);
};

const decreaseQty = async (product: Product) => {
  const task = async () => {
    const { appCookies, cart } = await reloadCart();

    const newCart = cart
      .map((item: CartItem) =>
        item.id === product.id ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item: CartItem) => item.qty > 0);

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
  };

  return appendToQueue(task);
};

const removeFromCart = async (product: Product) => {
  const task = async () => {
    const { appCookies, cart } = await reloadCart();

    const newCart = cart.filter((item: CartItem) => item.id !== product.id);

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
  };

  return appendToQueue(task);
};

const updateQty = async (product: Product, qty: number) => {
  const task = async () => {
    const { appCookies, cart } = await reloadCart();

    const newCart = cart.map((item: CartItem) =>
      item.id === product.id ? { ...item, qty } : item,
    );

    appCookies.set("cart", JSON.stringify(newCart), {
      httpOnly: false,
      path: "/",
      maxAge: undefined,
    });
  };

  return appendToQueue(task);
};

export { addToCart, decreaseQty, removeFromCart, updateQty };
