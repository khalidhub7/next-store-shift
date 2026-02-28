import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Props {
  params: { id: string };
}

const ProductDetails = async ({ params }: Props) => {
  const data = await fetch(
    `https://dummyjson.com/products/${(await params).id}`,
  ).then((res) => res.json());

  return (
    <section className=" w-4/5 h-screen mx-auto ">
      <article className="">
        <h3> {data.title} </h3>

        {/* should replace with chadcn carousel like */}
        <Image
          src={data.thumbnail}
          height={200}
          width={200}
          alt={data.title}
          sizes="(max-width: 768px) 100vw, 300px"
        />

        <Carousel>
          <CarouselContent>
            <CarouselItem>...</CarouselItem>
            <CarouselItem>...</CarouselItem>
            <CarouselItem>...</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

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
