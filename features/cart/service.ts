/* cart.ts (db)    → read/write storage
service.ts         → orchestrate (calls db + products)
actions.ts         → entry point (cookies, revalidate, call service)
queries.ts         → read-only (session check + get cart items) */

import "server-only";

import { MAX_QTY, CART_TTL } from "./constants";
import { updateCart } from "./db/cart";
import { Cart, CartItem } from "./types/cart";
import { appendToCartQueue } from "./db/cart";
import { fetchProductById } from "../products/server";
import { getOrCreateCart, deleteCart } from "./db/cart";

// helpers
// const testDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getValidCartByUserId = async (
  userId: string,
  useQueue: boolean = true,
) => {
  const task = async () => {
    const cart = await getOrCreateCart(userId, false);
    const expired = Date.now() - new Date(cart.updatedAt).getTime() > CART_TTL;

    if (expired) {
      // cleanup
      await deleteCart(userId, cart, false);
      const newCart = await getOrCreateCart(userId, false);
      return newCart;
    }
    return cart;
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

const addToCartService = async (
  userId: string,
  cart: Cart,
  productId: number,
  useQueue: boolean = true,
) => {
  const task = async () => {
    // throw new Error("test error")
    let found = false;
    let newCartItems: Array<CartItem>;
    const { items: cartItems } = cart;

    newCartItems = cartItems.map((p) => {
      if (p.id !== productId) return p;
      found = true;
      const qty = p.qty + 1;
      if (qty > MAX_QTY) throw new Error("Maximum quantity reached");
      return { ...p, qty };
    });
    if (!found) {
      const { id, title, price } = await fetchProductById(productId);
      newCartItems = [...newCartItems, { id, title, price, qty: 1 }];
    }
    await updateCart(userId, cart, newCartItems, false);
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

const increaseQtyService = async (
  userId: string,
  cart: Cart,
  productId: number,
  useQueue: boolean = true,
) => {
  const task = async () => {
    // throw new Error("test error")

    const { items: cartItems } = cart;
    const newCartItems = cartItems.map((item) => {
      if (item.id !== productId) return item;
      const qty = item.qty + 1;
      if (qty > MAX_QTY) throw new Error("Maximum quantity reached");
      return { ...item, qty };
    });

    /* // debug
    console.log("READ", JSON.stringify(cartItems));
    await testDelay(10000);
    console.log("WRITE", JSON.stringify(newCartItems)); */

    await updateCart(userId, cart, newCartItems, false); // update db
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

const decreaseQtyService = async (
  userId: string,
  cart: Cart,
  productId: number,
  useQueue: boolean = true,
) => {
  const task = async () => {
    // throw new Error("test error")
    const { items: cartItems } = cart;
    const newCartItems: Array<CartItem> = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item: CartItem) => item.qty > 0);

    await updateCart(userId, cart, newCartItems, false);
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

const removeFromCartService = async (
  userId: string,
  cart: Cart,
  productId: number,
  useQueue: boolean = true,
) => {
  const task = async () => {
    // throw new Error("test error")
    const { items: cartItems } = cart;
    const newCartItems: Array<CartItem> = cartItems.filter(
      (i: CartItem) => i.id !== productId,
    );

    await updateCart(userId, cart, newCartItems, false);
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

const updateQtyService = async (
  userId: string,
  cart: Cart,
  productId: number,
  qty: number,
  useQueue: boolean = true,
) => {
  const task = async () => {
    // throw new Error("test error"); // force fail for testing

    if (!Number.isInteger(qty) || qty < 0 || qty > MAX_QTY)
      throw new Error("Invalid Quantity");

    const { items: cartItems } = cart;
    const newCartItems: Array<CartItem> = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty } : item,
      )
      .filter((item: CartItem) => item.qty > 0);

    await updateCart(userId, cart, newCartItems, false);
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

export {
  updateQtyService,
  addToCartService,
  decreaseQtyService,
  increaseQtyService,
  getValidCartByUserId,
  removeFromCartService,
};
