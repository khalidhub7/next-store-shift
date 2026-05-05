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
import { readFile, writeFile, mkdir } from "fs/promises";

const cartsDir = path.join(process.cwd(), "storage", "cart", "carts");
await mkdir(cartsDir, { recursive: true });

// avoid race conditions
type Task = () => Promise<any>;

const cartsQueue = new Map();

const appendToQueue = async (cartId: string, task: Task) => {
  const cartQueue = cartsQueue.get(cartId) || Promise.resolve();

  const result = cartQueue.then(task);
  cartQueue.set(
    cartId,
    result.catch(() => {}),
  );
  return result;
};

// cart crud helpers

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
      return JSON.parse(data) as Session;
    } catch {
      return undefined;
    }
  };
  return appendToSessionQueue(sessionId, task);
};

const getCartByUserId = async (userId: string): Promise<Cart | null> => {
  const carts = await getCarts();
  return carts.find((c: Cart) => c.userId === userId) || null;
};

const createCart = async (
  userId: string,
  items: Array<CartItem>,
): Promise<string> => {
  const task = async () => {
    const carts = await getCarts();
    const newCart = {
      id: randomUUID(),
      userId,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    carts.push(newCart);
    await saveCarts(carts);
    return newCart.id;
  };
  return appendToQueue(task);
};

const updateCart = async (
  id: string,
  items: Array<CartItem>,
): Promise<void> => {
  const task = async () => {
    const carts = await getCarts();
    const newCarts = carts.map((c: Cart) =>
      c.id === id
        ? {
            ...c,
            items,
            updatedAt: new Date().toISOString(),
          }
        : c,
    );
    await saveCarts(newCarts);
  };

  return appendToQueue(task);
};

const deleteCart = async (id: string): Promise<void> => {
  const task = async () => {
    const carts = await getCarts();
    const newCarts = carts.filter((c: Cart) => c.id !== id);
    await saveCarts(newCarts);
  };

  return appendToQueue(task);
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
