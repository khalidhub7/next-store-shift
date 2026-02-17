const Auth = () => {
  // we can say that is user LoggedIn or session is experied
  const isLoggedIn = Math.random() < 0.5;

  return (
    <div className="p-24 text-center text-fuchsia-500 ">
        <p> {isLoggedIn ? "You are logged in" : "You are not logged in"} </p>
    </div>
  );
};

export const dynamic = "force-dynamic";
export default Auth;
