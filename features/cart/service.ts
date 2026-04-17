import { CartItem } from "./types/cart";
import { getCart, updateCart } from "./repository/cart";
import { fetchProductById } from "../products/service";

type Task = () => Promise<void>;

// help to avoid race conditions
let resolveActionsQueue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  // run task after queue
  const result = resolveActionsQueue.then(() => task());
  // queue never dies
  resolveActionsQueue = result.catch(() => {});
  // caller gets the real error
  return result;
};

const addToCartService = async (cartId: string, productId: string) => {
  const task = async () => {
    // throw new Error("test error")
    let newCartItems: Array<CartItem>;

    const cart = await getCart(cartId);

    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

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
  };

  return appendToQueue(task);
};

const increaseQtyService = async (cartId: string, productId: string) => {
  const task = async () => {
    // throw new Error("test error")

    let newCartItems: Array<CartItem>;
    const cart = await getCart(cartId);

    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

    newCartItems = cartItems.map((item: CartItem) =>
      item.id === productId ? { ...item, qty: item.qty + 1 } : item,
    );

    await updateCart(cartId, newCartItems); // update db
  };

  return appendToQueue(task);
};

const decreaseQtyService = async (cartId: string, productId: string) => {
  const task = async () => {
    // throw new Error("test error")

    let newCartItems: Array<CartItem>;
    const cart = await getCart(cartId);

    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

    newCartItems = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item: CartItem) => item.qty > 0);

    await updateCart(cartId, newCartItems);
  };

  return appendToQueue(task);
};

const removeFromCartService = async (cartId: string, productId: string) => {
  const task = async () => {
    // throw new Error("test error")

    let newCartItems: Array<CartItem>;
    const cart = await getCart(cartId);

    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

    newCartItems = cartItems.filter((i: CartItem) => i.id !== productId);

    await updateCart(cartId, newCartItems);
  };

  return appendToQueue(task);
};

const updateQtyService = async (
  cartId: string,
  productId: string,
  qty: number,
) => {
  const task = async () => {
    // throw new Error("test error"); // force fail for testing
    let newCartItems: Array<CartItem>;

    const cart = await getCart(cartId);
    if (!cart) throw new Error("Cart not found");

    const { items: cartItems } = cart;

    newCartItems = cartItems
      .map((item: CartItem) =>
        item.id === productId ? { ...item, qty } : item,
      )
      .filter((item: CartItem) => item.qty > 0);
    await updateCart(cartId, newCartItems);
  };

  return appendToQueue(task);
};

export {
  addToCartService,
  decreaseQtyService,
  removeFromCartService,
  updateQtyService,
  increaseQtyService,
};
