import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => (
  <>
    <div className=" max-w-3/4 mx-auto mt-10 p-6 rounded-lg shadow-md text-center ">
      <h3>electroNext</h3>
      <hr />
      <p>
        Your one-stop shop for modern electronic products. Discover laptops,
        phones, and accessories with clean design, fair prices, and fast
        delivery. Built for performance, quality, and everyday use.
      </p>
      <hr />
      <Button asChild size="lg" variant="outline">
        <Link href="/products">discover products</Link>
      </Button>
    </div>
  </>
);

export default Home;
