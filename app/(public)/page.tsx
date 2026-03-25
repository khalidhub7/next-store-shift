import Link from "next/link";
import { Button } from "@/components/ui/button";

const Home = () => (
  <section className="max-w-2xl mx-auto mt-24 px-8 py-16 rounded-2xl text-center flex flex-col items-center gap-8">
    <h1 className="text-5xl font-bold tracking-tight text-gray-900 hover:scale-105 transition-transform duration-300">
      GlowEssence
    </h1>

    <p className="text-gray-500 text-lg leading-relaxed">
      Elevate your beauty routine with everyday makeup essentials. From bold
      lipsticks to smooth mascaras and versatile palettes, our products are
      designed for quality, style, and confidence—at prices that fit your
      routine.
    </p>

    <Button
      asChild
      size="lg"
      variant="destructive"
      className="w-fit px-8 rounded-full font-semibold hover:opacity-80"
    >
      <Link href="/products">Discover</Link>
    </Button>
  </section>
);

export default Home;
