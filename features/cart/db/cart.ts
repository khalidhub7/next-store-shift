/* db access layer */
/* idea

Now (fake DB)
data/*.json = source of truth
db.ts = reads/writes files

Later (real DB)
DELETE data/ folder
db.ts → connects to real DB
*/

import path from "path";
import { randomUUID } from "crypto";
import { Cart, CartItem } from "../types/cart";
import { readFile, writeFile, mkdir, access, unlink } from "fs/promises";

// create files
const cartsDir = path.join(process.cwd(), "storage", "cart", "carts");
await mkdir(cartsDir, { recursive: true });
const emailIndexPath = path.join(
  process.cwd(),
  "storage",
  "cart",
  "userCartIndex.json",
);
try {
  await access(emailIndexPath);
} catch {
  await writeFile(emailIndexPath, "{}");
}

// avoid race conditions

type UserCartIndex = Record<string, string>;
type Task = () => Promise<any>;

const cartsQueue = new Map();
let userCartIndexQueue = Promise.resolve();

const appendToCartQueue = async (cartId: string, task: Task) => {
  const cartQueue = cartsQueue.get(cartId) || Promise.resolve();

  const result = cartQueue.then(task);
  cartQueue.set(
    cartId,
    result.catch(() => {}),
  );
  return result;
};

const appendToEmailIndexQueue = async (task: Task) => {
  const result = userCartIndexQueue.then(() => task());
  userCartIndexQueue = result.catch(() => {});
  return result;
};

// helpers
const writeCart = async (cart: Cart) => {
  const task = async () => {
    try {
      const userPath = path.join(
        process.cwd(),
        "storage",
        "cart",
        "carts",
        `${cart.id}.json`,
      );
      await writeFile(userPath, JSON.stringify(cart, null, 2));
    } catch (err) {
      throw err;
    }
  };
  return appendToCartQueue(cart.id, task);
};

// UserCartIndex crud
const getUserCartIndex = async (): Promise<UserCartIndex> => {
  const task = async () => {
    const data = await readFile(emailIndexPath, "utf-8");
    return JSON.parse(data) as UserCartIndex;
  };

  return appendToEmailIndexQueue(task);
};

const setUserCartIndex = async (index: UserCartIndex): Promise<void> => {
  const task = async () => {
    await writeFile(emailIndexPath, JSON.stringify(index, null, 2));
  };

  return appendToEmailIndexQueue(task);
};

const deleteUserCartIndex = async (userId: string): Promise<void> => {
  const task = async () => {
    const index = await getUserCartIndex();
    delete index[userId];
    await writeFile(emailIndexPath, JSON.stringify(index, null, 2));
  };
  return appendToEmailIndexQueue(task);
};

// cart crud
const getCart = async (cartId: string): Promise<Cart | null> => {
  const task = async () => {
    try {
      const sessionPath = path.join(
        process.cwd(),
        "storage",
        "auth",
        "carts",
        `${cartId}.json`,
      );
      const data = await readFile(sessionPath, "utf-8");
      return JSON.parse(data) as Cart;
    } catch {
      return undefined;
    }
  };
  return appendToCartQueue(cartId, task);
};

const getCartByUserId = async (userId: string): Promise<Cart | null> => {
  const index = await getUserCartIndex();
  const cartId = index[userId];

  if (!cartId) return null;
  return await getCart(cartId);
};

const createCart = async (
  userId: string,
  items: Array<CartItem>,
): Promise<string> => {
  const task = async () => {
    const newCart = {
      id: randomUUID(),
      userId,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userCartIndex = await getUserCartIndex();
    await setUserCartIndex({ ...userCartIndex, [userId]: newCart.id });
    await writeCart(newCart).catch(async (err) => {
      await deleteUserCartIndex(userId);
      throw err;
    });
    return newCart.id;
  };
  return task(); // not need to be queued
};

const updateCart = async (
  cartId: string,
  newItems: Array<CartItem>,
): Promise<void> => {
  const task = async () => {
    const cart = await getCart(cartId);

    if (!cart) throw new Error("Cart not found");

    await writeCart({
      ...cart,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  return appendToCartQueue(cartId, task);
};

const deleteCart = async (cartId: string): Promise<void> => {
  const task = async () => {
    const cart = await getCart(cartId);
    if (!cart) throw new Error("Cart not found");
    await deleteUserCartIndex(cart.userId);
    const cartPath = path.join(cartsDir, `${cartId}.json`);
    await unlink(cartPath);
  };
  return appendToCartQueue(cartId, task);
};

const getCartIdByUserId = async (userId: string): Promise<string | null> => {
  const cart = await getCartByUserId(userId);
  return cart?.id ?? null;
};

export {
  createCart,
  updateCart,
  deleteCart,
  getCart,
  getCartByUserId,
  getCartIdByUserId,
};
