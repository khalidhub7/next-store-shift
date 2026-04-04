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

export type { Product };
