import "server-only";
import { Product } from "../types/product";

type FetchResult<T> =
  | { success: true; status: number; data: T }
  | { success: false; status: number; error: string };

// hint: Uses parallel fetch if more than one dataset

const fetchProducts = async (): Promise<FetchResult<Array<Product>>> => {
  // add n to make it realistic
  const start = 80;
  const n = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const url = `https://dummyjson.com/products?limit=${n}&skip=${start}`;

  try {
    const res = await fetch(url);

    if (!res.ok)
      return { success: false, status: res.status, error: "HTTP error" };
    const { products } = await res.json();

    // always differentiate HTTP errors from network errors

    return { success: true, status: res.status, data: products };
  } catch {
    return { success: false, status: 0, error: "Network / connection error" };
  }
};

// console.log(params instanceof Promise) // true

const fetchProductById = async (id: number): Promise<FetchResult<Product>> => {
  try {
    const url = `https://dummyjson.com/products/${id}`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, status: 404, error: "Product not found" };
      }
      return { success: false, status: res.status, error: "HTTP error" };
    }

    const product = (await res.json()) as Product;
    return { success: true, status: res.status, data: product };
  } catch {
    return { success: false, status: 0, error: "Network / connection error" };
  }
};

export { fetchProductById, fetchProducts };
