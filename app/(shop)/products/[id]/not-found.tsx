import Link from "next/link";

export const metadata = {
  title: "Product Not Found | StoreName",
};

const NotFound = () => (
  <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
    <p className="text-7xl font-bold">404</p>
    <h1 className="mt-4 text-2xl font-semibold">Product Not Found</h1>
    <p className="mt-2 text-muted-foreground">
      The product you're looking for doesn't exist or has been removed.
    </p>
    <Link
      href="/products"
      className="mt-6 rounded-lg border px-4 py-2 hover:bg-muted"
    >
      Back to Products
    </Link>
  </section>
);

export default NotFound;
