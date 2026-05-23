interface CartItem {
  id: number;
  qty: number;
  title: string;
  price: number;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export type { CartItem, Cart };
