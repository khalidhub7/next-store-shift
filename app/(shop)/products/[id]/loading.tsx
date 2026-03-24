import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section className="w-4/5 h-screen mx-auto p-8">
      <article className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* title */}
        <Skeleton className="h-8 w-1/2 mx-auto md:col-span-2" />

        {/* image */}
        <div className="flex justify-center">
          <Skeleton className="h-[300px] w-[300px] rounded-xl" />
        </div>

        {/* actions */}
        <div className="bg-rose-50 p-4 rounded-2xl md:col-span-2">
          <Skeleton className="h-10 w-40 mx-auto" />
        </div>

        {/* description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        {/* info list */}
        <div className="md:col-span-2 p-5 border shadow">
          <div className="flex flex-col md:flex-row gap-4 justify-around">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </article>
    </section>
  );
};

export default Loading;
