interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export type { User, CreateUserData };
