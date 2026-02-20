const Loading = () => {
  return (
    <section className="max-w-3xl mx-auto mt-10 p-6 rounded-lg shadow-md text-center flex flex-col gap-8 animate-pulse">
      <header>
        <div className="h-6 w-32 bg-gray-100 rounded mx-auto" />
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="border rounded shadow p-4 flex flex-col gap-4 w-sm md:w-full"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-4 w-10 bg-gray-100 rounded" />
            </div>

            <div className="w-full aspect-[16/12] bg-gray-100 rounded" />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Loading;
