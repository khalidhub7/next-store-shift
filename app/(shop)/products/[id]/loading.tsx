import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section className="max-w-5xl mx-auto mt-16 px-6 pb-16">
      <article className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Title */}
        <Skeleton className="h-9 w-1/2 mx-auto md:col-span-2" />

        {/* Carousel */}
        <div className="flex items-center justify-center">
          <Skeleton className="h-[300px] w-[300px] rounded-xl" />
        </div>

        {/* Description */}
        <div className="self-center space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        {/* Actions */}
        <div className="md:col-span-2 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
          <Skeleton className="h-10 w-40 mx-auto" />
        </div>

        {/* Stats */}
        <div className="md:col-span-2 border-y border-gray-100 py-5">
          <div className="flex flex-col md:flex-row items-center md:justify-around gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>

      </article>
    </section>
  );
};

export default Loading;