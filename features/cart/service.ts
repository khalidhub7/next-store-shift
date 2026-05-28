/* cart.ts (db)    → read/write storage
service.ts         → orchestrate (calls db + products)
actions.ts         → entry point (cookies, revalidate, call service)
queries.ts         → read-only (session check + get cart items) */

import "server-only";

import { CartItem } from "./types/cart";
import { appendToCartQueue } from "./db/cart";
import { getCart, updateCart } from "./db/cart";
import { fetchProductById } from "../products/server";
import { getOrCreateCart, deleteCart } from "./db/cart";

const getValidCartByUserId = async (userId: string) => {
  const CART_TTL = 1000 * 60 * 60 * 24 * 3;

  const task = async () => {
    const cart = await getOrCreateCart(userId, false);
    const expired = Date.now() - new Date(cart.updatedAt).getTime() > CART_TTL;

    if (expired) {
      // cleanup
      await deleteCart(userId, cart.id, false);
      const newCart = await getOrCreateCart(userId, false);
      return newCart;
    }
    return cart;
  };
  return appendToCartQueue(userId, task);
};

const addToCartService = async (
  userId: string,
  cartId: string,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")
    let newCartItems: Array<CartItem>;
    const cart = await getCart(userId, cartId, false);
    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

    // update cart in db
    const productInCart = cartItems.find((i: CartItem) => i.id === productId);
    // console.log(`*** ${JSON.stringify(productInCart, null, 2)} ***`);

    if (productInCart) {
      newCartItems = cartItems.map((p: CartItem) =>
        p.id === productId ? { ...p, qty: p.qty + 1 } : p,
      );
    } else {
      const { id, title, price } = await fetchProductById(productId);
      newCartItems = [...cartItems, { id, title, price, qty: 1 }];
    }
    await updateCart(userId, cartId, newCartItems, false);
  };

  await appendToCartQueue(userId, task);
};

const increaseQtyService = async (
  userId: string,
  cartId: string,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")

    let newCartItems: Array<CartItem>;
    const cart = await getCart(userId, cartId, false);
    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

    newCartItems = cartItems.map((item: CartItem) => {
      if (item.id === productId) {
        const qty = item.qty + 1;
        if (qty > 10) throw new Error("Invalid Quantity");
        return { ...item, qty };
      } else {
        return item;
      }
    });

    await updateCart(userId, cartId, newCartItems, false); // update db
  };
  await appendToCartQueue(userId, task);
};

const decreaseQtyService = async (
  userId: string,
  cartId: string,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")

    let newCartItems: Array<CartItem>;
    const cart = await getCart(userId, cartId, false);
    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;
    newCartItems = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item: CartItem) => item.qty > 0);
    await updateCart(userId, cartId, newCartItems, false);
  };
  await appendToCartQueue(userId, task);
};

const removeFromCartService = async (
  userId: string,
  cartId: string,
  productId: number,
) => {
  const task = async () => {
    // throw new Error("test error")

    let newCartItems: Array<CartItem>;
    const cart = await getCart(userId, cartId, false);
    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;
    newCartItems = cartItems.filter((i: CartItem) => i.id !== productId);
    await updateCart(userId, cartId, newCartItems, false);
  };
  await appendToCartQueue(userId, task);
};

const updateQtyService = async (
  userId: string,
  cartId: string,
  productId: number,
  qty: number,
) => {
  const task = async () => {
    // throw new Error("test error"); // force fail for testing

    if (!Number.isInteger(qty) || qty < 0 || qty > 10)
      throw new Error("Invalid Quantity");

    let newCartItems: Array<CartItem>;
    const cart = await getCart(userId, cartId, false);
    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

    newCartItems = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty } : item,
      )
      .filter((item: CartItem) => item.qty > 0);
    await updateCart(userId, cartId, newCartItems, false);
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
