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
    <section className="max-w-3xl mx-auto mt-10 p-6 rounded-lg shadow-md text-center flex flex-col gap-8">
      <header>
        <h1 className="text-fuchsia-600 font-bold">Products</h1>
      </header>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {data.products.map((p: any) => (
          <div></div>
        ))}
      </ul>
    </section>
  );
};

export const revalidate = 60; // revalidate every 60 seconds
export default Products;