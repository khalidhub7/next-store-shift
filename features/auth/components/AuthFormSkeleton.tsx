import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AuthFormSkeleton = () => (
  <Card className="max-w-sm mx-auto">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>

    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />

      <Skeleton className="h-10 w-full" />

      <Skeleton className="h-10 w-full" />

      <Skeleton className="h-10 w-full" />

      <div className="flex justify-center">
        <Skeleton className="h-4 w-40" />
      </div>
    </CardContent>
  </Card>
);

export { AuthFormSkeleton };
