/*
cart.ts (db)     → read/write storage
service.ts       → orchestrate (calls db + products)
actions.ts       → entry point (cookies, revalidate, call service)
queries.ts       → read-only (session check + get cart items)
*/

import "server-only";

import { updateCart } from "./db/cart";
import { CartItem } from "./types/cart";
import { appendToCartQueue } from "./db/cart";
import { MAX_QTY, CART_TTL } from "./constants";
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

const addToCartService = async (userId: string, productId: number) => {
  const task = async () => {
    const cart = await getValidCartByUserId(userId, false);
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
      const result = await fetchProductById(productId);
      if (result.success) {
        const { id, title, price } = result.data;
        newCartItems = [...newCartItems, { id, title, price, qty: 1 }];
      } else throw new Error(result.error);
    }
    await updateCart(userId, cart, newCartItems, false);
  };
  return appendToCartQueue(userId, task);
};

const increaseQtyService = async (userId: string, productId: number) => {
  const task = async () => {
    // throw new Error("test error")

    const cart = await getValidCartByUserId(userId, false);

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
  return appendToCartQueue(userId, task);
};

const decreaseQtyService = async (userId: string, productId: number) => {
  const task = async () => {
    // throw new Error("test error")
    const cart = await getValidCartByUserId(userId, false);
    const { items: cartItems } = cart;

    const newCartItems: Array<CartItem> = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item: CartItem) => item.qty > 0);

    await updateCart(userId, cart, newCartItems, false);
  };
  return appendToCartQueue(userId, task);
};

const removeFromCartService = async (userId: string, productId: number) => {
  const task = async () => {
    // throw new Error("test error")
    const cart = await getValidCartByUserId(userId, false);
    const { items: cartItems } = cart;

    const newCartItems: Array<CartItem> = cartItems.filter(
      (i: CartItem) => i.id !== productId,
    );

    await updateCart(userId, cart, newCartItems, false);
  };
  return appendToCartQueue(userId, task);
};

const updateQtyService = async (
  userId: string,
  productId: number,
  qty: number,
) => {
  const task = async () => {
    // throw new Error("test error"); // force fail for testing

    const cart = await getValidCartByUserId(userId, false);

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
  return appendToCartQueue(userId, task);
};

export {
  updateQtyService,
  addToCartService,
  decreaseQtyService,
  increaseQtyService,
  getValidCartByUserId,
  removeFromCartService,
};
