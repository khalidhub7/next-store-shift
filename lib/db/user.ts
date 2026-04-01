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
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

const usersFilePath = path.join(process.cwd(), "lib/data/users.json");

// user crud helpers
const getUsers = async () => {
  const data = await fs.readFile(usersFilePath, "utf-8");
  return data === "" ? [] : JSON.parse(data);
};
const saveUsers = async (users: any[]) => {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

// user crud
const getUserById = async (id: string) => {
  const users = await getUsers();
  return users.find((u: any) => u.id === id);
};

const getUserByEmail = async (email: string) => {
  const users = await getUsers();
  return users.find((u: any) => u.email === email);
};

const createUser = async (userData: any) => {
  // userData like {email, pswd}
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

const updateUser = async (id: string, userData: any) => {
  const users = await getUsers();
  const newUsers = users.map((u: any) =>
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

const deleteUser = async (id: string) => {
  const users = await getUsers();
  const newUsers = users.filter((u: any) => u.id !== id);
  await saveUsers(newUsers);
};

export { createUser, updateUser, deleteUser, getUserById, getUserByEmail };
