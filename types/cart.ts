interface CartItem {
  id: string;
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
