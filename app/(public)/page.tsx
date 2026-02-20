import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => (
  <section className="md:max-w-4/5 mx-auto mt-10 p-12 rounded-lg shadow-md text-center flex flex-col gap-10">
    <h1>electroNext</h1>

    <p>
      Your one-stop shop for modern electronic products. Discover laptops,
      phones, and accessories with clean design, fair prices, and fast delivery.
      Built for performance, quality, and everyday use.
    </p>

    <Button asChild size="lg" variant="destructive" className="w-fit">
      <Link href="/products">discover products</Link>
    </Button>
  </section>
);

export default Home;
