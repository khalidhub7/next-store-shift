interface Product {
  id: string;
}

const ProductDetails = async ({ id }: Product) => {
  const data = await fetch(
    `https://dummyjson.com/products/${id}`,
  ).then((res) => res.json());

  
};
