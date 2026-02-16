const Products = async () => {
  // add n to make it realistic
  const n = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const data = await fetch(`https://dummyjson.com/products?limit=${n}`)
    .then((res) => res.json())
    .catch(() => console.log("something's wrong while fetching products"));

  return (
    <section className="max-w-3/4 mx-auto mt-10 p-6 rounded-lg shadow-md text-center flex flex-col gap-8">
      <header>
        <h3>products</h3>
      </header>
      <ul>
        {data.products.map((p) => (
          <li key={p.id}>
            <div>
              <h3> {p.title} </h3>
              <span>${p.price}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Products;
