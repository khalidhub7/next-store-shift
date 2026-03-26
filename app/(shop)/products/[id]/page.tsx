import Image from "next/image";
import { Carousel } from "@/components/ui/carousel";
import { fetchProductById } from "@/lib/fetchProduct";
import { ClientAddToCart } from "../../../../components/client-parts/ClientActions";
import { CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ProductDetailsProps {
  params: Promise<{ id: string }>;
}

const ProductDetails = async ({ params }: ProductDetailsProps) => {
  const { id } = await params;
  const product = await fetchProductById(id);

  // console.log(`*** ${JSON.stringify(product)} ***`);

  return (
    <section className="max-w-5xl mx-auto mt-16 px-6 pb-16">
      <article className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Title */}
        <h1 className="md:col-span-2 text-3xl font-bold text-gray-900 text-center">
          {product.title}
        </h1>

        {/* Carousel */}
        <Carousel className="flex items-center justify-center">
          <CarouselContent>
            {product.images.map((current, i) => (
              <CarouselItem key={i}>
                <Image
                  src={current}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="object-cover mx-auto rounded-xl"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Description */}
        <p className="text-gray-500 text-base leading-relaxed self-center">
          {product.description}
        </p>

        {/* actions */}
        <div className="md:col-span-2 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
          {/* ithink form should used here */}
          <ClientAddToCart productId={id} />
        </div>

        {/* Stats */}
        <div className="md:col-span-2 border-y border-gray-100 py-5">
          <ul className="flex flex-col md:flex-row items-center md:justify-around gap-3 text-sm text-gray-600">
            <li className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Rating
              </span>
              <span className="font-semibold text-gray-900">
                {product.rating}
              </span>
            </li>
            <li className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Stock
              </span>
              <span className="font-semibold text-gray-900">
                {product.stock}
              </span>
            </li>
            <li className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Category
              </span>
              <span className="font-semibold text-gray-900">
                {product.category}
              </span>
            </li>
            <li className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Brand
              </span>
              <span className="font-semibold text-gray-900">
                {product.brand}
              </span>
            </li>
            <li className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Discount
              </span>
              <span className="font-semibold text-emerald-600">
                {product.discountPercentage}%
              </span>
            </li>
            <li className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Price
              </span>
              <span className="font-semibold text-emerald-600">
                ${product.price}
              </span>
            </li>
          </ul>
        </div>
      </article>
    </section>
  );
};

export const revalidate = 60;
export default ProductDetails;
