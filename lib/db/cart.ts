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
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

const cartsFilePath = path.join(process.cwd(), "lib/data/carts.json");

// cart crud helpers
const getCarts = async () => {
  const data = await fs.readFile(cartsFilePath, "utf-8");
  return data === "" ? [] : JSON.parse(data);
};
const saveCarts = async (carts: any[]) => {
  await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
};

// cart crud
const getCart = async (id: string) => {
  const carts = await getCarts();
  return carts.find((c: any) => c.id === id);
};
const createCart = async (items: any[]) => {
  const carts = await getCarts();
  const newCart = {
    id: randomUUID(),
    userId: "unknown",
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  carts.push(newCart);
  await saveCarts(carts);
  return newCart.id;
};
const updateCart = async (id: string, items: any[]) => {
  const carts = await getCarts();
  const newCarts = carts.map((c: any) =>
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
  const newCarts = carts.filter((c: any) => c.id !== id);
  await saveCarts(newCarts);
};

export { createCart, updateCart, deleteCart, getCart };
