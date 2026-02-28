import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Props {
  params: Promise<{ id: string }>;
}
interface Product {
  title: string;
  images: Array<string>;
}

const ProductDetails = async ({ params }: Props) => {
  const { id } = await params;
  const url = `https://dummyjson.com/products/${id}`;
  /* console.log(params instanceof Promise) */
  const data: Product = await fetch(url).then((res) => res.json());

  return (
    <section className=" w-4/5 h-screen mx-auto ">
      <article className="">
        <h3> {data.title} </h3>

        <Carousel>
          <CarouselContent>
            {data.images.map((current, i) => (
              <CarouselItem key={i}>
                <Image
                  src={current}
                  alt={data.title}
                  width={200}
                  height={200}
                  className=" object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </CarouselItem>
            ))}
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
