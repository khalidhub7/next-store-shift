import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section className="max-w-6xl mx-auto mt-16 px-6 flex flex-col gap-10">
      
      <header className="text-center flex flex-col gap-2">
        <Skeleton className="h-3 w-24 mx-auto" />
        <Skeleton className="h-8 w-36 mx-auto" />
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-sm md:max-w-none mx-auto w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="border border-gray-100 rounded-2xl shadow-sm bg-white overflow-hidden flex flex-col">
            
            {/* Image skeleton */}
            <Skeleton className="w-full aspect-[16/12]" />

            {/* Info skeleton */}
            <div className="flex flex-col gap-4 px-4 pb-4 pt-4">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>

          </li>
        ))}
      </ul>

    </section>
  );
};

export default Loading;