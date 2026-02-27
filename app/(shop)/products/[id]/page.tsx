import Image from "next/image";
interface Props {
  params: { id: string };
}

const ProductDetails = async ({ params }: Props) => {
  const data = await fetch(
    `https://dummyjson.com/products/${(await params).id}`,
  ).then((res) => res.json());

  return (
    <section className="">
      <article>
        <h3> {data.title} </h3>
        <Image src={data.thumbnail} fill alt={data.title} />

        <div>{data.description}</div>
        <div>
          <div>
            <p> {data.rating} </p>
            <p> {data.stock} </p>
            <p> {data.category} </p>
          </div>
          <div>
            <p> {data.brand} </p>
            <p> {data.discountPercentage} </p>
            <p> {data.price} </p>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ProductDetails;
