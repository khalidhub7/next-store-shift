import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldOff } from "lucide-react";

const Auth = async ({ searchParams }: any) => {
  /* simple fake auth logic */
  const { auth } = await searchParams;
  const isLoggedIn = auth === "true";

  return (
    <div className="h-96 flex flex-col items-center justify-center gap-3">
      {/* Icon */}
      {isLoggedIn ? (
        <ShieldCheck className="w-10 h-10 text-emerald-500" />
      ) : (
        <ShieldOff className="w-10 h-10 text-rose-400" />
      )}

      {/* Label */}
      <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase">
        Auth Status
      </p>

      {/* Badge */}
      <Badge
        variant={isLoggedIn ? "default" : "destructive"}
        className={cn(
          "text-sm px-4 py-1 rounded-full font-semibold",
          isLoggedIn
            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
            : "bg-rose-100 text-rose-700 border border-rose-300",
        )}
      >
        {isLoggedIn ? "Logged In" : "Logged Out"}
      </Badge>
    </div>
  );
};

export const dynamic = "force-dynamic";
export default Auth;
