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
    <section className="w-4/5 h-screen mx-auto p-8">
      <article className="grid grid-cols-1 md:grid-cols-2">
        <h1 className="md:col-span-2 text-fuchsia-500 font-bold p-5 flex items-center justify-center">
          {data.title}
        </h1>

        {/* tomorrow
        ask gpt guess the w and h of image
        to deep understand
        */}
        <Carousel className="md:w-1/5 mx-auto md:mx-1 p-5 flex items-center justify-center">
          <CarouselContent className="">
            {data.images.map((current, i) => (
              <CarouselItem key={i} className="bg-amber-200">
                <Image
                  src={current}
                  alt={data.title}
                  width={300}
                  height={300}
                  className="object-cover mx-auto"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <p className="text-sm text-gray-600 p-5">{data.description}</p>
        <div className="p-5 border-8 border-t-transparent border-r-transparent border-b-transparent">
          <ul className="flex flex-col justify-center items-center">
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
