import { CartItem } from "./types/cart";
import { getCart, updateCart } from "./db/cart";
import { fetchProductById } from "../products/server";
import { getCartByUserId, deleteCart } from "./db/cart";

/* cart.ts (db)    → read/write storage
service.ts         → orchestrate (calls db + products)
actions.ts         → entry point (cookies, revalidate, call service)
queries.ts         → read-only (session check + get cart items) */

const getValidCartByUserId = async (userId: string) => {
  const CART_TTL = 1000 * 60 * 60 * 24 * 3;
  const cart = await getCartByUserId(userId);

  if (!cart) return undefined;
  const expired = Date.now() - new Date(cart.updatedAt).getTime() > CART_TTL;
  if (expired) {
    await deleteCart(userId, cart.id);
    return undefined;
  }
  return cart;
};

const addToCartService = async (
  userId: string,
  cartId: string,
  productId: string,
) => {
  // throw new Error("test error")

  let newCartItems: Array<CartItem>;
  const cart = await getCart(userId, cartId);

  if (!cart) throw new Error("Cart not found");

  const { items: cartItems } = cart;
  // update cart in db
  const productInCart = cartItems.find((i: CartItem) => i.id === productId);

  if (productInCart)
    newCartItems = cartItems.map((p: CartItem) =>
      p.id === productId ? { ...p, qty: p.qty + 1 } : p,
    );
  else {
    const { id, title, price } = await fetchProductById(productId);
    newCartItems = [...cartItems, { id, title, price, qty: 1 }];
  }

  await updateCart(userId, cartId, newCartItems);
};

const increaseQtyService = async (
  userId: string,
  cartId: string,
  productId: string,
) => {
  // throw new Error("test error")

  let newCartItems: Array<CartItem>;
  const cart = await getCart(userId, cartId);
  if (!cart) throw new Error("Cart not found");

  const { items: cartItems } = cart;
  newCartItems = cartItems.map((item: CartItem) =>
    item.id === productId ? { ...item, qty: item.qty + 1 } : item,
  );
  await updateCart(userId, cartId, newCartItems); // update db
};

const decreaseQtyService = async (
  userId: string,
  cartId: string,
  productId: string,
) => {
  // throw new Error("test error")

  let newCartItems: Array<CartItem>;
  const cart = await getCart(userId, cartId);
  if (!cart) throw new Error("Cart not found");

  const { items: cartItems } = cart;
  newCartItems = cartItems
    .map((item: CartItem) =>
      item.id === productId ? { ...item, qty: item.qty - 1 } : item,
    )
    .filter((item: CartItem) => item.qty > 0);
  await updateCart(userId, cartId, newCartItems);
};

const removeFromCartService = async (
  userId: string,
  cartId: string,
  productId: string,
) => {
  // throw new Error("test error")

  let newCartItems: Array<CartItem>;
  const cart = await getCart(userId, cartId);
  if (!cart) throw new Error("Cart not found");

  const { items: cartItems } = cart;
  newCartItems = cartItems.filter((i: CartItem) => i.id !== productId);
  await updateCart(userId, cartId, newCartItems);
};

const updateQtyService = async (
  userId: string,
  cartId: string,
  productId: string,
  qty: number,
) => {
  // throw new Error("test error"); // force fail for testing
  let newCartItems: Array<CartItem>;
  const cart = await getCart(userId, cartId);
  if (!cart) throw new Error("Cart not found");

  const { items: cartItems } = cart;
  newCartItems = cartItems
    .map((item: CartItem) => (item.id === productId ? { ...item, qty } : item))
    .filter((item: CartItem) => item.qty > 0);
  await updateCart(userId, cartId, newCartItems);
};

export {
  updateQtyService,
  addToCartService,
  decreaseQtyService,
  increaseQtyService,
  getValidCartByUserId,
  removeFromCartService,
};
