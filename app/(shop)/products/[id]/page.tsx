import Image from "next/image";
import { notFound } from "next/navigation";
import { Product } from "@/types/product";
import { addToCart } from "@/app/actions/cart";
import { ClientAddToCart } from "@/app/components/ClientActions";
import { fetchProductById } from "@/lib/fetchProduct";

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
  const product = await fetchProductById(id);

  // console.log(`*** ${JSON.stringify(product)} ***`);

  return (
    <section className="w-4/5 h-screen mx-auto p-8">
      <article className="grid grid-cols-1 md:grid-cols-2">
        <h1 className="md:col-span-2 text-fuchsia-500 font-bold p-5 flex items-center justify-center">
          {product.title}
        </h1>

        <Carousel className=" flex items-center justify-center">
          <CarouselContent className="">
            {product.images.map((current, i) => (
              <CarouselItem key={i} className="">
                <Image
                  src={current}
                  alt={product.title}
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

        {/* actions */}
        <div className="bg-rose-50 p-2 rounded-2xl md:order-1 md:col-span-2">
          <form action={addToCart.bind(null, id)}>
            <ClientAddToCart productId={id} compType="products" />
          </form>
        </div>

        <p className="text-sm text-gray-600 p-5">{product.description}</p>
        <div className="md:order-2 md:col-span-2 p-5 border-4 border-t-transparent border-b-transparent shadow">
          <ul className="flex flex-col md:flex-row items-center md:justify-around">
            <li>rating : {product.rating}</li>
            <li>stock : {product.stock}</li>
            <li>category : {product.category}</li>
            <li>brand : {product.brand}</li>
            <li>discountPercentage : {product.discountPercentage}</li>
            <li>price : {product.price}</li>
          </ul>
        </div>
      </article>
    </section>
  );
};

export const revalidate = 60;
export default ProductDetails;
