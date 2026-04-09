/* db access layer */
/* idea

Now (fake DB)
data/*.json = source of truth
db.ts = reads/writes files

Later (real DB)
DELETE data/ folder
db.ts → connects to real DB
*/
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { Cart, CartItem } from "@/types/cart";
import { readFile, writeFile } from "fs/promises";

const cartsFilePath = fileURLToPath(
  new URL("../data/carts.json", import.meta.url),
);

// avoid race conditions
type Task = () => Promise<any>;

let queue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  const result = queue.then(() => task());
  queue = result.catch(() => {});
  return result;
};

// cart crud helpers
const getCarts = async () => {
  try {
    const data = await readFile(cartsFilePath, "utf-8");
    return data === "" ? [] : JSON.parse(data);
  } catch {
    return [];
  }
};

const saveCarts = async (carts: Array<Cart>) => {
  try {
    await writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    return;
  } catch (err) {
    console.log("Failed to write to carts.json");
    throw err;
  }
};

// cart crud
const getCart = async (id: string) => {
  const carts = await getCarts();
  return carts.find((c: Cart) => c.id === id);
};

const getCartByUserId = async (userId: string) => {
  const carts = await getCarts();
  return carts.find((c: Cart) => c.userId === userId) || null;
};

const createCart = async (userId: string, items: Array<CartItem>) => {
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

const updateCart = async (id: string, items: Array<CartItem>) => {
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
const deleteCart = async (id: string) => {
  const task = async () => {
    const carts = await getCarts();
    const newCarts = carts.filter((c: Cart) => c.id !== id);
    await saveCarts(newCarts);
  };

  return appendToQueue(task);
};

export { createCart, updateCart, deleteCart, getCart, getCartByUserId };
