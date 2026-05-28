/* db access layer */
/* idea

Now (fake DB)
storage/cart/carts & userCartIndex = source of truth
db/cart.ts = reads/writes files

Later (real DB)
DELETE storage/ folder
db/cart.ts → connects to real DB
*/
import "server-only";

// assume that Filesystem operations are always success
import path from "path";
import { randomUUID } from "crypto";
import { Cart, CartItem } from "../types/cart";
import { readFile, writeFile, mkdir, access, unlink } from "fs/promises";

// create files
const cartsDir = path.join(process.cwd(), "storage", "cart", "carts");
await mkdir(cartsDir, { recursive: true });
const userCartIndexPath = path.join(
  process.cwd(),
  "storage",
  "cart",
  "userCartIndex.json",
);
try {
  await access(userCartIndexPath);
} catch {
  await writeFile(userCartIndexPath, "{}");
}

// avoid race conditions

type UserCartIndex = Record<string, string>;
type Task<T = any> = () => Promise<T>;

const cartsQueue = new Map<string, Promise<void>>();
let userCartIndexQueue = Promise.resolve();

const appendToCartQueue = async (userId: string, task: Task) => {
  const last = cartsQueue.get(userId) || Promise.resolve();
  const next = last.then(task); // Promise A
  const safeNext = next.catch(() => {}); // Promise B
  // Promise A and Promise B are diff Promises

  cartsQueue.set(userId, safeNext);
  safeNext.finally(() => {
    if (cartsQueue.get(userId) === safeNext) cartsQueue.delete(userId);
  });
  return next;
};

const appendToCartIndexQueue = async (task: Task) => {
  const result = userCartIndexQueue.then(() => task());
  userCartIndexQueue = result.catch(() => {});
  return result;
};

// helpers
const writeCart = async (cart: Cart, useQueue: boolean = true) => {
  const task = async () => {
    const userPath = path.join(
      process.cwd(),
      "storage",
      "cart",
      "carts",
      `${cart.id}.json`,
    );
    await writeFile(userPath, JSON.stringify(cart, null, 2));
  };
  return useQueue ? appendToCartQueue(cart.userId, task) : task();
};

// UserCartIndex crud
const getUserCartIndex = async (
  useQueue: boolean = true,
): Promise<UserCartIndex> => {
  const task = async () => {
    const data = await readFile(userCartIndexPath, "utf-8");
    return JSON.parse(data) as UserCartIndex;
  };
  return useQueue ? appendToCartIndexQueue(task) : task();
};

const setUserCartIndex = async (
  userId: string,
  cartId: string,
  useQueue: boolean = true,
): Promise<void> => {
  const task = async () => {
    const index = await getUserCartIndex(false);

    await writeFile(
      userCartIndexPath,
      JSON.stringify({ ...index, [userId]: cartId }, null, 2),
    );
  };

  return useQueue ? appendToCartIndexQueue(task) : task();
};

const deleteUserCartIndex = async (
  userId: string,
  useQueue: boolean = true,
): Promise<void> => {
  const task = async () => {
    const index = await getUserCartIndex(false);
    delete index[userId];
    await writeFile(userCartIndexPath, JSON.stringify(index, null, 2));
  };
  return useQueue ? appendToCartIndexQueue(task) : task();
};

// cart crud
const getCart = async (
  userId: string,
  cartId: string,
  useQueue: boolean = true,
): Promise<Cart | undefined> => {
  // useQueue help to avoid deadlock

  const task = async () => {
    try {
      const sessionPath = path.join(
        process.cwd(),
        "storage",
        "cart",
        "carts",
        `${cartId}.json`,
      );
      const data = await readFile(sessionPath, "utf-8");
      return JSON.parse(data) as Cart;
    } catch {
      return undefined;
    }
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

const getCartByUserId = async (userId: string) => {
  const index = await getUserCartIndex();
  const cartId = index[userId];
  if (!cartId) return undefined;

  const task = async () => {
    const cart = await getCart(userId, cartId, false);
    if (!cart) {
      await deleteUserCartIndex(userId);
      return undefined;
    }
    return cart;
  };
  return appendToCartQueue(userId, task);
};

const createCart = async (
  userId: string,
  items: Array<CartItem>,
): Promise<string> => {
  const task = async () => {
    const index = await getUserCartIndex();
    const userCartId = index[userId];
    if (userCartId) return userCartId;

    const cartId = randomUUID();
    const now = new Date().toISOString();

    const newCart = {
      id: cartId,
      userId,
      items,
      createdAt: now,
      updatedAt: now,
    };

    await setUserCartIndex(newCart.userId, cartId);
    await writeCart(newCart, false);
    return newCart.id;
  };
  return appendToCartQueue(userId, task);
};

const getOrCreateCart = async (userId: string): Promise<string> => {
  const task = async () => {
    const index = await getUserCartIndex(false);
    if (index[userId]) return index[userId]; // already exists

    const cartId = randomUUID();
    const now = new Date().toISOString();
    const newCart = { id: cartId, userId, items: [], createdAt: now, updatedAt: now };

    await setUserCartIndex(userId, cartId);
    await writeCart(newCart, false);
    return cartId;
  };
  return appendToCartQueue(userId, task);
};

const updateCart = async (
  userId: string,
  cartId: string,
  newItems: Array<CartItem>,
  useQueue: boolean = true,
): Promise<void> => {
  const task = async () => {
    const cart = await getCart(userId, cartId, false);

    if (!cart) throw new Error("Cart not found");
    await writeCart(
      {
        ...cart,
        items: newItems,
        updatedAt: new Date().toISOString(),
      },
      false,
    );
  };
  return useQueue ? appendToCartQueue(userId, task) : task();
};

const deleteCart = async (userId: string, cartId: string): Promise<void> => {
  const task = async () => {
    // check cart
    const cart = await getCart(userId, cartId, false);
    if (!cart) throw new Error("Cart not found");
    // delete index
    await deleteUserCartIndex(cart.userId);
    // delete file
    const cartPath = path.join(cartsDir, `${cartId}.json`);
    await unlink(cartPath);
  };
  return appendToCartQueue(userId, task);
};

const getCartIdByUserId = async (userId: string): Promise<string | null> => {
  const index = await getUserCartIndex();
  return index[userId] ?? null;
};

// cart CRUD
export {
  getCart,
  createCart,
  updateCart,
  deleteCart,
  getOrCreateCart,
  getCartByUserId,
  getCartIdByUserId,
};

// queue helper for atomic cart mutations
export { appendToCartQueue };
