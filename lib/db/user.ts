/* db access layer */
/* idea

Now (fake DB)
data/*.json = source of truth
db/* = reads/writes files

Later (real DB)
DELETE data/ folder
db.ts → connects to real DB
*/

import { randomUUID } from "crypto";
import { CreateUserData, User } from "@/types/user";

import path from "path";
import { readFile, writeFile } from "fs/promises";

const usersFilePath = path.join(process.cwd(), "lib", "data", "users.json");

type Task = () => Promise<any>;

let queue = Promise.resolve();
const appendToQueue = async (task: Task) => {
  const result = queue.then(() => task());
  queue = result.catch(() => {});
  return result;
};

// user crud helpers
const getUsers = async (): Promise<Array<User>> => {
  try {
    const data = await readFile(usersFilePath, "utf-8");
    return data === "" ? [] : JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveUsers = async (users: Array<User>): Promise<void> => {
  try {
    await writeFile(usersFilePath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.log("Failed to write to users.json");
    throw err;
  }
};

// user crud
const getUserById = async (id: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find((u: User) => u.id === id);
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find((u: User) => u.email === email);
};

const createUser = async (userData: CreateUserData): Promise<string> => {
  // userData like {email, pswd}
  const task = async () => {
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
