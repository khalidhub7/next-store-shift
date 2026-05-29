/* cart.ts (db)    → read/write storage
service.ts         → orchestrate (calls db + products)
actions.ts         → entry point (cookies, revalidate, call service)
queries.ts         → read-only (session check + get cart items) */

import "server-only";

import { updateCart } from "./db/cart";
import { Cart, CartItem } from "./types/cart";
import { appendToCartQueue } from "./db/cart";
import { fetchProductById } from "../products/server";
import { getOrCreateCart, deleteCart } from "./db/cart";

// helpers
// const testDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getValidCartByUserId = async (userId: string) => {
  const CART_TTL = 1000 * 60 * 60 * 24 * 3;

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
  return appendToCartQueue(userId, task);
};

const addToCartService = async (
  userId: string,
  cart: Cart,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")
    let added = false;
    let newCartItems: Array<CartItem>;
    const { items: cartItems } = cart;

    newCartItems = cartItems.map((p: CartItem) => {
      if (p.id === productId) {
        const qty = p.qty + 1;
        if (qty > 10) throw new Error("Maximum quantity reached");
        added = true;
        return p.id === productId ? { ...p, qty } : p;
      } else {
        return p;
      }
    });

    if (!added) {
      const { id, title, price } = await fetchProductById(productId);
      newCartItems = [...newCartItems, { id, title, price, qty: 1 }];
    }
    await updateCart(userId, cart, newCartItems, false);
  };

  await appendToCartQueue(userId, task);
};

const increaseQtyService = async (
  userId: string,
  cart: Cart,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")

    let newCartItems: Array<CartItem>;
    const { items: cartItems } = cart;

    const exists = cartItems.some((p) => p.id === productId);
    if (!exists) throw new Error("Item not found in cart");

    newCartItems = cartItems.map((item: CartItem) => {
      if (item.id === productId) {
        const qty = item.qty + 1;
        if (qty > 10) throw new Error("Maximum quantity reached");
        return { ...item, qty };
      } else {
        return item;
      }
    });

    /* // debug
    console.log("READ", JSON.stringify(cartItems));
    await testDelay(10000);
    console.log("WRITE", JSON.stringify(newCartItems)); */

    await updateCart(userId, cart, newCartItems, false); // update db
  };
  await appendToCartQueue(userId, task);
};

const decreaseQtyService = async (
  userId: string,
  cart: Cart,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")
    let newCartItems: Array<CartItem>;
    const { items: cartItems } = cart;

    const exists = cartItems.some((p) => p.id === productId);
    if (!exists) throw new Error("Item not found in cart");

    newCartItems = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item: CartItem) => item.qty > 0);
    await updateCart(userId, cart, newCartItems, false);
  };
  await appendToCartQueue(userId, task);
};

const removeFromCartService = async (
  userId: string,
  cart: Cart,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")
    let newCartItems: Array<CartItem>;
    const { items: cartItems } = cart;

    const exists = cartItems.some((p) => p.id === productId);
    if (!exists) throw new Error("Item not found in cart");

    newCartItems = cartItems.filter((i: CartItem) => i.id !== productId);
    await updateCart(userId, cart, newCartItems, false);
  };
  await appendToCartQueue(userId, task);
};

const updateQtyService = async (
  userId: string,
  cart: Cart,
  productId: number,
  qty: number,
) => {
  const task = async () => {
    // throw new Error("test error"); // force fail for testing

    if (!Number.isInteger(qty) || qty < 0 || qty > 10)
      throw new Error("Invalid Quantity");
    let newCartItems: Array<CartItem>;
    const { items: cartItems } = cart;

    const exists = cartItems.some((p) => p.id === productId);
    if (!exists) throw new Error("Item not found in cart");

    newCartItems = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty } : item,
      )
      .filter((item: CartItem) => item.qty > 0);
    await updateCart(userId, cart, newCartItems, false);
  };
  await appendToCartQueue(userId, task);
};

export {
  updateQtyService,
  addToCartService,
  decreaseQtyService,
  increaseQtyService,
  getValidCartByUserId,
  removeFromCartService,
};
