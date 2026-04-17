import { Product } from "@/features/products";
import { ProductCard } from "@/features/products";
import { fetchProducts } from "@/features/products";

const Products = async () => {
  const products = await fetchProducts();

  return (
    <section className="max-w-6xl mx-auto mt-16 px-6 flex flex-col gap-10">
      <header className="text-center flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Our Collection
        </span>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-sm md:max-w-none mx-auto w-full">
        {products.products.map((p: Product) => (
          <ProductCard p={p} key={p.id} />
        ))}
      </ul>
    </section>
  );
};

export const revalidate = 60; // revalidate every 60 seconds
export default Products;
