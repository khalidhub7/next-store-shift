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
const getCarts = async (): Promise<Array<Cart>> => {
  try {
    const data = await readFile(cartsFilePath, "utf-8");
    return data === "" ? [] : JSON.parse(data);
  } catch {
    return [];
  }
};

const saveCarts = async (carts: Array<Cart>): Promise<void> => {
  try {
    await writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    return;
  } catch (err) {
    console.log("Failed to write to carts.json");
    throw err;
  }
};

// cart crud
const getCart = async (id: string): Promise<Cart | null> => {
  const carts = await getCarts();
  return carts.find((c: Cart) => c.id === id) ?? null;
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
