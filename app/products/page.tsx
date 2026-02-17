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
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {data.products.map((p: any) => (
          <li
            key={p.id}
            className="border rounded shadow p-4 flex flex-col gap-4 w-sm md:w-full"
          >
            <div className="flex items-center justify-between">
              <h3> {p.title} </h3>
              <span>${p.price}</span>
            </div>
            <div className="">
              <AspectRatio ratio={16 / 12}>
                <Image src={p.thumbnail} alt={p.title} fill />
              </AspectRatio>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Products;
