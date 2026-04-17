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

export { fetchProducts };
