interface Props {
  params: { id: string };
}

const ProductDetails = async ({ params }: Props) => {
  const data = await fetch(
    `https://dummyjson.com/products/${(await params).id}`,
  ).then((res) => res.json());

  return <p> {data.id} </p>;
};

export default ProductDetails;
