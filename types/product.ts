interface Product {
  id: string;
  title: string;
  stock: number;
  brand: string;
  price: number;
  rating: number;
  category: string;
  thumbnail: string;
  description: string;
  images: Array<string>;
  discountPercentage: number;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  qty: number;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export type { Product, CartItem };
