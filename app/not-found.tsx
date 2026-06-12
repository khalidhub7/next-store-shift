import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found",
};

const NotFound = () => (
  <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
    <p className="text-7xl font-bold">404</p>
    <h1 className="mt-4 text-2xl font-semibold">Lost in the catalog?</h1>
    <p className="mt-2 text-muted-foreground">
      The page you're looking for does not exist.
    </p>
    <Link href="/" className="mt-6 rounded-lg border px-4 py-2 hover:bg-muted">
      Back Home
    </Link>
  </section>
);

export default NotFound;