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

export type { Product, CartItem };
