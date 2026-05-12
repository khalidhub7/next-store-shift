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
const testDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getEmailIndex = async (): Promise<EmailIndexType> => {
  try {
    const users = await readFile(emailIndexPath, "utf-8");
    return JSON.parse(users);
  } catch {
    return {} as EmailIndexType;
  }
};

const setEmailIndex = async (id: string, email: string) => {
  const task = async () => {
    const data = await getEmailIndex();
    if (data[email])
      throw new Error(
        "Unable to create account. Try logging in if you already registered.",
      );
    await writeFile(
      emailIndexPath,
      JSON.stringify({ ...data, [email]: id }, null, 2),
    );
  };
  return appendToEmailIndexQueue(task);
};

const deleteEmailIndex = async (email: string) => {
  const task = async () => {
    const data = await getEmailIndex();
    if (!data[email]) throw new Error("Email not found");
    delete data[email];
    await writeFile(emailIndexPath, JSON.stringify(data, null, 2));
  };
  return appendToEmailIndexQueue(task);
};

const writeUser = async (user: User) => {
  const task = async () => {
    try {
      console.log("*** here ***");
      const userPath = path.join(
        process.cwd(),
        "storage",
        "auth",
        "users",
        `${user.id}.json`,
      );
      console.log(userPath);
      await writeFile(userPath, JSON.stringify(user, null, 2));
    } catch (err) {
      throw err;
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
  // not need to be queued bcs EmailIndex already  guarantees email uniqueness
  const emailIndex = await getEmailIndex();

  const id = emailIndex[email];
  return id ? await getUserById(id) : undefined;
};

const createUser = async (
  userData: CreateUserData,
): Promise<string | false> => {
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
    await writeUser(newUser).catch(async (err) => {
      // rollback and rethrow
      await deleteEmailIndex(newUser.email);
      throw err;
    });
    return newUser.id;
  };
  // not need to be queued
  return task();
};

const updateUser = async (
  id: string,
  newData: Partial<User>,
): Promise<void> => {
  const task = async () => {
    try {
      const user = await getUserById(id);
      if (!user) throw new Error("user not found");
      const updatedUser = { ...user, ...newData };

      await writeUser(updatedUser);
    } catch (err) {
      throw err;
    }
  };
  // not need to be queued
  return task();
};

const deleteUser = async (id: string): Promise<void> => {
  const userTask = async () => {
    const userPath = path.join(
      process.cwd(),
      "storage",
      "auth",
      "users",
      `${id}.json`,
    );
    const user = await getUserById(id);
    if (!user) throw new Error("User not found");
    await unlink(userPath);
    return user.email;
  };

  const email = await appendToUserQueue(id, userTask);

  const emailTask = async () => {
    const emailIndex = await getEmailIndex();
    delete emailIndex[email];
    await writeFile(emailIndexPath, JSON.stringify(emailIndex, null, 2));
  };

  return appendToEmailIndexQueue(emailTask);
};

export { createUser, updateUser, deleteUser, getUserById, getUserByEmail };
