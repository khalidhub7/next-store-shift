"use server";

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
      path: "/products",
      maxAge: undefined,
    });
  };

  return appendToQueue(task);
};
