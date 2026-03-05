import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Product } from "@/types/product";

interface ProductCardProps {
  p: Product;
}

const ProductCard = ({ p }: ProductCardProps) => {
  return (
    <li className="border rounded shadow p-4 flex flex-col gap-4 w-96 md:w-full">
      <article>
        <div className="flex items-center justify-between">
          <h2> {p.title} </h2>
          <span>${p.price}</span>
        </div>
        <div className="">
          <AspectRatio ratio={16 / 12}>
            <Image
              src={p.thumbnail}
              alt={p.title}
              fill
              /* If screen ≤ 768px → image is 100vw (full width) */
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </AspectRatio>
        </div>
        <div className="flex justify-end ">
          <Button asChild size="sm" variant="destructive">
            <Link href={`/products/${p.id}`}>details</Link>
          </Button>
        </div>
      </article>
    </li>
  );
};

export default ProductCard;
