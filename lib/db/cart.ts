/* db access layer */
/* idea

Now (fake DB)
data/*.json = source of truth
db.ts = reads/writes files

Later (real DB)
DELETE data/ folder
db.ts → connects to real DB
*/

import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { Cart, CartItem } from "@/types/cart";

const cartsFilePath = fileURLToPath(
  new URL("../data/carts.json", import.meta.url),
);

// avoid race conditions
type Task = () => Promise<void>;
let queue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  const result = queue.then(() => task());
  queue = result.catch(() => {});
  return result;
};

// cart crud helpers
const getCarts = async () => {
  const data = await fs.readFile(cartsFilePath, "utf-8");
  return data === "" ? [] : JSON.parse(data);
};

const saveCarts = async (carts: Array<Cart>) => {
  await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
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
    
  }
};
const updateCart = async (id: string, items: Array<CartItem>) => {
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
const deleteCart = async (id: string) => {
  const carts = await getCarts();
  const newCarts = carts.filter((c: Cart) => c.id !== id);
  await saveCarts(newCarts);
};

export { createCart, updateCart, deleteCart, getCart, getCartByUserId };
