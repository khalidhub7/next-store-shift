import Image from "next/image";
import { notFound } from "next/navigation";
import { Product } from "@/types/product";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductDetailsProps {
  params: Promise<{ id: string }>;
}

const ProductDetails = async ({ params }: ProductDetailsProps) => {
  const { id } = await params;
  const url = `https://dummyjson.com/products/${id}`;
  // console.log(params instanceof Promise)

  const res = await fetch(url);
  res.ok ? undefined : notFound();

  const data: Product = await res.json();

  // console.log(`*** ${JSON.stringify(data)} ***`);

  return (
    <section className="w-4/5 h-screen mx-auto p-8">
      <article className="grid grid-cols-1 md:grid-cols-2">
        <h1 className="md:col-span-2 text-fuchsia-500 font-bold p-5 flex items-center justify-center">
          {data.title}
        </h1>

        <Carousel className=" flex items-center justify-center">
          <CarouselContent className="">
            {data.images.map((current, i) => (
              <CarouselItem key={i} className="">
                <Image
                  src={current}
                  alt={data.title}
                  width={300}
                  height={300}
                  className="object-cover mx-auto"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <p className="text-sm text-gray-600 p-5">{data.description}</p>
        <div className="md:col-span-2 p-5 border-4 border-t-transparent border-b-transparent shadow">
          <ul className="flex flex-col md:flex-row items-center md:justify-around">
            <li>rating : {data.rating}</li>
            <li>stock : {data.stock}</li>
            <li>category : {data.category}</li>
            <li>brand : {data.brand}</li>
            <li>discountPercentage : {data.discountPercentage}</li>
            <li>price : {data.price}</li>
          </ul>
        </div>
      </article>
    </section>
  );
};

export const revalidate = 60;
export default ProductDetails;
