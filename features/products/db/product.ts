import { Product } from "../types/product";
import { notFound } from "next/navigation";

// hint: Uses parallel fetch if more than one dataset

const fetchProducts = async () => {
  // add n to make it realistic
  const n = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const url = `https://dummyjson.com/products?limit=${n}`;
  const products = await fetch(url)
    .then((res) => res.json())
    .catch(() => ({ products: [] }));

  // always differentiate HTTP errors from network errors

  return products;
};

const fetchProductById = async (id: string) => {
  let res: Response;

  try {
    const url = `https://dummyjson.com/products/${id}`;
    // console.log(params instanceof Promise) // true
    res = await fetch(url);
  } catch (_) {
    throw new Error("Network / runtime error");
  }

  if (!res.ok) notFound();

  const product = (await res.json()) as Product;
  return { ...product, id: String(id) };
};

export { fetchProductById, fetchProducts };
