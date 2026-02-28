import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/* types should define in other file hmm */

interface Props {
  params: Promise<{ id: string }>;
}
interface Product {
  title: string;
  stock: number;
  brand: string;
  price: number;
  rating: number;
  category: string;
  description: string;
  images: Array<string>;
  discountPercentage: number;
}

const ProductDetails = async ({ params }: Props) => {
  const { id } = await params;
  const url = `https://dummyjson.com/products/${id}`;
  /* console.log(params instanceof Promise) */

  const data: Product = await fetch(url).then((res) => res.json());

  return (
    <section className=" w-4/5 h-screen mx-auto ">
      <article className="">
        <h1> {data.title} </h1>

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

        <p>{data.description}</p>
        <div>
          <ul>
            <li>rating: {data.rating}</li>
            <li>stock: {data.stock}</li>
            <li>category: {data.category}</li>
            <li>brand: {data.brand}</li>
            <li>discountPercentage: {data.discountPercentage}</li>
            <li>price: {data.price}</li>
          </ul>
        </div>
      </article>
    </section>
  );
};

export default ProductDetails;
