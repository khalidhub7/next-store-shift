import { Badge } from "@/components/ui/badge";

const Auth = async ({ searchParams }: any) => {
  const { auth } = await searchParams;
  const isLoggedIn = auth === "true";

  return (
    <div className=" h-96 text-fuchsia-500 flex items-center justify-center font-mono ">
      auth status:
      <Badge variant="destructive">
        {isLoggedIn ? "logged in" : "logged out"}
      </Badge>
    </div>
  );
};

export const dynamic = "force-dynamic";
export default Auth;
