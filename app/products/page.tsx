import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Products = async () => {
  // add n to make it realistic
  const n = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const data = await fetch(`https://dummyjson.com/products?limit=${n}`)
    .then((res) => res.json())
    .catch(() => console.log("something's wrong while fetching products"));

  return (
    <section className="max-w-3/4 mx-auto mt-10 p-6 rounded-lg shadow-md text-center flex flex-col gap-8">
      <header>
        <h3>products</h3>
      </header>
      <ul>
        {data.products.map((p: any) => (
          <li key={p.id}>
            <div>
              <h3> {p.title} </h3>
              <span>${p.price}</span>
            </div>
            <div>
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={p.thumbnail}
                  alt={p.title}
                  width={600}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </AspectRatio>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Products;
