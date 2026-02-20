const Auth = async ({ searchParams }: any) => {
  const { auth } = await searchParams;
  const isLoggedIn = auth === "true";

  return (
    <div className=" h-96 text-fuchsia-500 flex items-center justify-center font-mono ">
      <p>{isLoggedIn ? "You are logged in" : "You are not logged in"}</p>
    </div>
  );
};

export const dynamic = "force-dynamic";
export default Auth;
