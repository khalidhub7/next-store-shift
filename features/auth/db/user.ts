/* db access layer */
/* idea

Now (fake DB)
data/*.json = source of truth
db/* = reads/writes files

Later (real DB)
DELETE data/ folder
db.ts → connects to real DB
*/

import path from "path";
import { mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import { User, CreateUserData } from "../types/user";
import { readFile, writeFile, access } from "fs/promises";

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

// setup queues
type Task = () => Promise<any>;
type EmailIndexType = Record<string, string>;

const userQueues = new Map(); // write user
let emailIndexQueue = Promise.resolve(); // ensures email stays unique (lock)

const appendToUserQueue = async (userId: string, task: Task) => {
  const queue = userQueues.get(userId) || Promise.resolve();

  const result = queue.then(task);
  userQueues.set(
    userId,
    result.catch(() => {}),
  );
  return result;
};

const appendToEmailIndexQueue = async (task: Task) => {
  const result = emailIndexQueue.then(() => task());
  emailIndexQueue = result.catch(() => {});
  return result;
};

// user crud helpers
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const getEmailIndex = async (): Promise<EmailIndexType> => {
  try {
    const users = await readFile(emailIndexPath, "utf-8");
    return JSON.parse(users);
  } catch {
    return {} as EmailIndexType;
  }
};

const saveEmailIndex = async (users: EmailIndexType): Promise<void> => {
  try {
    await writeFile(emailIndexPath, JSON.stringify(users, null, 2));
  } catch (err) {
    // console.log("Failed to write users");
    throw err;
  }
};

const setEmailIndexEntry = async (id: string, email: string) => {
  const task = async () => {
    try {
      const data = await getEmailIndex();
      await saveEmailIndex({ ...data, [email]: id });
      return true;
    } catch {
      return false;
    }
  };
  return appendToEmailIndexQueue(task);
};

const writeUser = async (user: User) => {
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
      return true;
    } catch {
      return false;
    }
  };
  return appendToUserQueue(user.id, task);
};

// user crud
const getUserById = async (id: string): Promise<User | undefined> => {
  const task = async () => {
    const userPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "users",
      `${id}.json`,
    );
    try {
      const data = await readFile(userPath, "utf-8");
      const user = JSON.parse(data);
      return user as User;
    } catch {
      return undefined;
    }
  };
  // return appendToUserQueue(id, task);
  return task();
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  // ques: why this does not need to be queued
  const emailIndex = await getEmailIndex();

  const id = emailIndex[email];
  return id ? await getUserById(id) : undefined;
};

const createUser = async (
  userData: CreateUserData,
): Promise<string | false> => {
  // userData like {email, pswd, role}

  const id = randomUUID();
  const task = async () => {
    // await delay(10000); // 10s delay (for testing)
    try {
      const newUser = {
        id,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const emailIndexSaved = await setEmailIndexEntry(
        newUser.id,
        newUser.email,
      );
      const userWritten = await writeUser(newUser);
      if (!emailIndexSaved || !userWritten) return false;
      return newUser.id;
    } catch {
      return false;
    }
  };

  return appendToUserQueue(id, task);
};

const updateUser = async (
  id: string,
  userData: Partial<User>,
): Promise<void> => {
  const task = async () => {
    const users = await getUsers();
    const newUsers = users.map((u: User) =>
      u.id === id
        ? {
            ...u,
            ...userData,
            updatedAt: new Date().toISOString(),
          }
        : u,
    );
    await saveUsers(newUsers);
  };
  return appendToQueue(task);
};

const deleteUser = async (id: string): Promise<void> => {
  const task = async () => {
    const users = await getUsers();
    const newUsers = users.filter((u: User) => u.id !== id);
    await saveUsers(newUsers);
  };
  return appendToQueue(task);
};

export { createUser, updateUser, deleteUser, getUserById, getUserByEmail };
