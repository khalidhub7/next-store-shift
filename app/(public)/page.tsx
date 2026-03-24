import Link from "next/link";
import { Button } from "@/components/ui/button";


const Home = () => (
  <section className="md:max-w-4/5 mx-auto mt-10 p-12 rounded-lg shadow-md text-center flex flex-col gap-10">
    <h1 className="text-4xl font-medium text-fuchsia-500 hover:scale-105 transition-transform duration-300">
      GlowEssence
    </h1>

    <p>
      Elevate your beauty routine with everyday makeup essentials. From bold
      lipsticks to smooth mascaras and versatile palettes, our products are
      designed for quality, style, and confidence—at prices that fit your
      routine.
    </p>

    <Button
      asChild
      size="lg"
      variant="destructive"
      className="w-fit hover:opacity-80"
    >
      <Link href="/products">discover</Link>
    </Button>
  </section>
);

export default Home;
