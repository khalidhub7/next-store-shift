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
import { object } from "zod/v3";

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

// queue
type Task = () => Promise<any>;
type EmailIndexType = Record<string, string>;

const userQueues = new Map();
let emailIndexQueue = Promise.resolve();

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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// user crud helpers
const getUsers = async (): Promise<EmailIndexType> => {
  try {
    const users = await readFile(emailIndexPath, "utf-8");
    return JSON.parse(users);
  } catch {
    return {} as EmailIndexType;
  }
};

const saveUsers = async (users: EmailIndexType): Promise<void> => {
  try {
    await writeFile(emailIndexPath, JSON.stringify(users, null, 2));
  } catch (err) {
    // console.log("Failed to write users");
    throw err;
  }
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
  return appendToEmailIndexQueue(task);
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const task = async () => {
    const users = await getUsers();

    for (const [id, userEmail] of Object.entries(users)) {
      if (email === userEmail) {
        const user = await getUserById(id);
        if (!user) return undefined;
        return user;
      }
    }
    return undefined;
  };
  return appendToEmailIndexQueue(task);
};

const createUser = async (userData: CreateUserData): Promise<string> => {
  // userData like {email, pswd}
  const task = async () => {
    // await delay(10000); // 10s delay (for testing)
    const users = await getUsers();
    const newUser = {
      id: randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await saveUsers(users);
    return newUser.id;
  };

  return appendToQueue(task);
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
