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
import { readFile, writeFile, mkdir, access } from "fs/promises";

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
