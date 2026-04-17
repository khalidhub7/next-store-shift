import { Product } from "./types/product";
import { notFound } from "next/navigation";

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

export { fetchProductById };
