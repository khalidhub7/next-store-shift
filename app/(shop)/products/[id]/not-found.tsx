/* global error */
// app/not-found.tsx

const NotFound = () => (
  <section className="max-w-5xl mx-auto mt-16 px-6 pb-16 flex flex-col items-center justify-center gap-4 text-center">
    <span className="text-6xl">🔍</span>
    <h1 className="text-3xl font-bold text-gray-900">Product Not Found</h1>
    <p className="text-gray-500 text-base">
      The product you're looking for doesn't exist or has been removed.
    </p>
  </section>
);

export default NotFound;
