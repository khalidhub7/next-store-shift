import Image from "next/image";
interface Props {
  params: { id: string };
}

const ProductDetails = async ({ params }: Props) => {
  const data = await fetch(
    `https://dummyjson.com/products/${(await params).id}`,
  ).then((res) => res.json());

  return (
    <section>
      <article>
        <h3> {data.title} </h3>
        <Image src={data.thumbnail} fill alt={data.title} />
      </article>
    </section>
  );
};

export default ProductDetails;
