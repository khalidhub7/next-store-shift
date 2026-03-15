import { Product } from "@/types/product";
import { notFound } from "next/navigation";

const fetchProductById = async (id: string) => {
  try {
    const url = `https://dummyjson.com/products/${id}`;
    // console.log(params instanceof Promise) // true
    const res = await fetch(url);
    if (!res.ok) notFound();
    const product: Product = await res.json();
    return product;
  } catch (_) {
    throw new Error("Network / runtime error");
  }
};

export { fetchProductById };
