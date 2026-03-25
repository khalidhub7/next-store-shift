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
    <li className="border border-gray-100 rounded-2xl shadow-sm bg-white flex flex-col w-full overflow-hidden hover:shadow-md transition-shadow duration-300">
      <article className="flex flex-col gap-4">
        {/* Image */}
        <div className="w-full">
          <AspectRatio ratio={16 / 12}>
            <Image
              src={p.thumbnail}
              alt={p.title}
              fill
              className="object-cover"
              /* If screen ≤ 768px → image is 100vw (full width) */
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </AspectRatio>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {p.title}
            </h2>
            <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
              ${p.price}
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              asChild
              size="sm"
              variant="destructive"
              className="rounded-full px-5 text-xs font-semibold"
            >
              <Link href={`/products/${p.id}`}>Details</Link>
            </Button>
          </div>
        </div>
      </article>
    </li>
  );
};

export default ProductCard;
