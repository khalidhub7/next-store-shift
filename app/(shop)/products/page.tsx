import { Product } from "@/types/product";
import ProductCard from "@/app/components/ProductCard";
// hint: Uses parallel fetch if more than one dataset

const Products = async () => {
  // add n to make it realistic
  const n = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const url = `https://dummyjson.com/products?limit=${n}`;
  const data = await fetch(url)
    .then((res) => res.json())
    .catch(() => ({ products: [] }));

  // always differentiate HTTP errors from network errors

  return (
    <section className="max-w-6xl mx-auto mt-16 px-6 flex flex-col gap-10">
      
      <header className="text-center flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Our Collection
        </span>
        <h1 className="text-3xl font-bold text-gray-900">
          Products
        </h1>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.products.map((p: Product) => (
          <ProductCard p={p} key={p.id} />
        ))}
      </ul>

    </section>
  );
};

export const revalidate = 60; // revalidate every 60 seconds
export default Products;