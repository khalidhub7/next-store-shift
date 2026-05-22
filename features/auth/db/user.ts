/* db access layer */
/* idea

Now (fake DB)
storage/auth/users & emailIndex.json = source of truth
db/user.ts = reads/writes files

Later (real DB)
DELETE storage/ folder
db/user.ts → connects to real DB
*/

import path from "path";
import { mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import { User, CreateUserData } from "../types/user";
import { readFile, writeFile, access, unlink } from "fs/promises";

// create files
const usersDir = path.join(process.cwd(), "storage", "auth", "users");
await mkdir(usersDir, { recursive: true });
const emailIndexPath = path.join(
  process.cwd(),
  "storage",
  "auth",
  "emailIndex.json",
);
try {
  await access(emailIndexPath);
} catch {
  await writeFile(emailIndexPath, "{}");
}

// helpers
// const testDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// setup queues
type Task = () => Promise<any>;
type EmailIndexType = Record<string, string>;

const userQueues = new Map(); // write user
let emailIndexQueue = Promise.resolve(); // ensures email stays unique (lock)

const appendToUserQueue = async (userId: string, task: Task) => {
  const queue = userQueues.get(userId) || Promise.resolve();
  const result = queue.then(task);
  const safeResult = result.catch(() => {});

  userQueues.set(userId, safeResult);
  safeResult.finally(() => {
    if (userQueues.get(userId) === safeResult) userQueues.delete(userId);
  });
  return result;
};

const appendToEmailIndexQueue = async (task: Task) => {
  const result = emailIndexQueue.then(() => task());
  emailIndexQueue = result.catch(() => {});
  return result;
};

// email index crud helpers

const getEmailIndex = async (
  useQueue: boolean = true,
): Promise<EmailIndexType> => {
  const task = async () => {
    const users = await readFile(emailIndexPath, "utf-8");
    return JSON.parse(users);
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
    if (data[email]) {
      throw new Error(
        "Unable to create account. Try logging in if you already registered.",
      );
    }
    await writeFile(
      emailIndexPath,
      JSON.stringify({ ...data, [email]: id }, null, 2),
    );
  };
  return useQueue ? appendToEmailIndexQueue(task) : task();
};

const deleteEmailIndex = async (email: string, useQueue: boolean = true) => {
  const task = async () => {
    const data = await getEmailIndex(false);
    if (!data[email]) throw new Error("Email not found");
    delete data[email];
    await writeFile(emailIndexPath, JSON.stringify(data, null, 2));
  };
  return useQueue ? appendToEmailIndexQueue(task) : task();
};

// user crud
const writeUser = async (user: User, useQueue: boolean = true) => {
  const task = async () => {
    const userPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "users",
      `${user.id}.json`,
    );
    await writeFile(userPath, JSON.stringify(user, null, 2));
  };
  return useQueue ? appendToUserQueue(user.id, task) : task();
};

// user crud
const getUserById = async (id: string): Promise<User> => {
  const task = async () => {
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
  };
  return task();
};

const getUserByEmail = async (email: string): Promise<User> => {
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
    await writeUser(newUser, false).catch(async (err) => {
      // rollback and rethrow
      await deleteEmailIndex(newUser.email);
      throw err;
    });
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
    const user = await getUserById(id);

    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      ...newData,
      updatedAt: new Date().toISOString(),
    };

    // email changed
    if (newData.email && newData.email !== user.email) {
      await deleteEmailIndex(user.email);
      try {
        await setEmailIndex(id, newData.email);
      } catch (err) {
        await setEmailIndex(id, user.email); // rollback old email
        throw err;
      }
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
    const user = await getUserById(id);
    if (!user) throw new Error("User not found");

    await unlink(userPath); // remove user
    await deleteEmailIndex(user.email); // remove index
  };
  return useQueue ? appendToUserQueue(id, task) : task();
};

export { createUser, updateUser, deleteUser, getUserById, getUserByEmail };
