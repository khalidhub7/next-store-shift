/* db access layer */
/* idea

Now (fake DB)
storage/auth/users & emailIndex.json = source of truth
db/user.ts = reads/writes files

Later (real DB)
DELETE storage/ folder
db/user.ts → connects to real DB
*/
import "server-only";

import path from "path";
import { mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import { User, CreateUserData } from "../types/user";
import { readFile, writeFile, unlink } from "fs/promises";

// assume that Filesystem operations are always success

// create files
const usersDir = path.join(process.cwd(), "storage", "auth", "users");
await mkdir(usersDir, { recursive: true });
const emailIndexPath = path.join(
  process.cwd(),
  "storage",
  "auth",
  "emailIndex.json",
);
await writeFile(emailIndexPath, "{}", { flag: "wx" }).catch(() => {});

// helpers
// const testDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// setup queues
// type Task<T = any> = () => Promise<T>;
type Task<T> = () => Promise<T>;
type EmailIndexType = Record<string, string>;

// one queue per userId to run tasks one at a time, in order
const userQueues = new Map<string, Promise<unknown>>();
// global lock to run email tasks one at a time, in order
let emailIndexQueue: Promise<unknown> = Promise.resolve();

const appendToUserQueue = async <T>(
  userId: string,
  task: Task<T>,
): Promise<T> => {
  const queue = userQueues.get(userId) || Promise.resolve();
  const result = queue.then(task);
  const safeResult = result.catch(() => {});

  userQueues.set(userId, safeResult);
  safeResult.finally(() => {
    if (userQueues.get(userId) === safeResult) userQueues.delete(userId);
  });
  return result;
};

const appendToEmailIndexQueue = async <T>(task: Task<T>) => {
  const result = emailIndexQueue.then(() => task());
  emailIndexQueue = result.catch(() => {});
  return result;
};

// email index crud helpers

const getEmailIndex = async (
  useQueue: boolean = true,
): Promise<EmailIndexType> => {
  const task = async () => {
    try {
      const users = await readFile(emailIndexPath, "utf-8");
      return JSON.parse(users);
    } catch {
      return {};
    }
  };
  return useQueue ? appendToEmailIndexQueue(task) : task();
};

const setEmailIndex = async (
  id: string,
  email: string,
  useQueue: boolean = true,
) => {
  const task = async () => {
    const data = await getEmailIndex(false);
    if (data[email])
      throw new Error(
        "Unable to create account. Try logging in if you already registered.",
      );
    await writeFile(emailIndexPath, JSON.stringify({ ...data, [email]: id }));
  };
  return useQueue ? appendToEmailIndexQueue(task) : task();
};

const deleteEmailIndex = async (email: string, useQueue: boolean = true) => {
  const task = async () => {
    try {
      const data = await getEmailIndex(false);
      if (!data[email]) throw new Error("Email not found");
      delete data[email];
      await writeFile(emailIndexPath, JSON.stringify(data, null, 2));
    } catch {
      throw new Error("Failed to delete email index");
    }
  };
  return useQueue ? appendToEmailIndexQueue(task) : task();
};

// user crud
const writeUser = async (user: User, useQueue: boolean = true) => {
  const task = async () => {
    try {
      const userPath = path.join(
        process.cwd(),
        "storage",
        "auth",
        "users",
        `${user.id}.json`,
      );
      await writeFile(userPath, JSON.stringify(user, null, 2));
    } catch {
      throw new Error("Failed to write user");
    }
  };
  return useQueue ? appendToUserQueue(user.id, task) : task();
};

// user crud
const getUserById = async (
  id: string,
  useQueue: boolean = true,
): Promise<User | undefined> => {
  const task = async () => {
    try {
      if (!id) throw new Error();
      const userPath = path.join(
        process.cwd(),
        "storage",
        "auth",
        "users",
        `${id}.json`,
      );
      const data = await readFile(userPath, "utf-8");
      const user = JSON.parse(data);
      return user as User;
    } catch {
      return undefined;
    }
  };
  return useQueue ? appendToUserQueue(id, task) : task();
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const emailIndex = await getEmailIndex();
  const id = emailIndex[email];
  return await getUserById(id);
};

const createUser = async (
  userData: CreateUserData,
  useQueue: boolean = true,
): Promise<string> => {
  // userData like {email, password, role}

  const id = randomUUID();
  const task = async () => {
    // await delay(10000); // 10s delay (for testing)
    const newUser = {
      id,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // setEmailIndex throw email if already registered
    await setEmailIndex(newUser.id, newUser.email);
    await writeUser(newUser, false);
    return newUser.id;
  };
  return useQueue ? appendToUserQueue(id, task) : task();
};

const updateUser = async (
  id: string,
  newData: Partial<User>,
  useQueue: boolean = true,
): Promise<void> => {
  const task = async () => {
    const user = await getUserById(id, false);
    if (!user) throw new Error("user not found");

    const updatedUser = {
      ...user,
      ...newData,
      updatedAt: new Date().toISOString(),
    };

    // email changed need to change index
    const newEmail = newData.email;
    if (newEmail && newEmail !== user.email) {
      const emailIndexTask = async () => {
        const index = await getEmailIndex();
        if (index[newEmail]) throw new Error("Email is already in use"); // is new email already taken
        await deleteEmailIndex(user.email, false); // delete old email
        await setEmailIndex(id, newEmail, false); // set new email
      };
      await appendToEmailIndexQueue(emailIndexTask);
    }
    await writeUser(updatedUser, false);
  };

  return useQueue ? appendToUserQueue(id, task) : task();
};

const deleteUser = async (
  id: string,
  useQueue: boolean = true,
): Promise<void> => {
  const task = async () => {
    // check user
    const userPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "users",
      `${id}.json`,
    );
    const user = await getUserById(id, false);
    if (!user) throw new Error("user not found");

    await deleteEmailIndex(user.email); // remove index
    await unlink(userPath); // remove user
  };
  return useQueue ? appendToUserQueue(id, task) : task();
};

export { createUser, updateUser, deleteUser, getUserById, getUserByEmail };
