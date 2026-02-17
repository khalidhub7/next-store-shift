const Auth = () => {
  const isLoggedIn = Math.random() < 0.5;

  return <p> {isLoggedIn ? "You are logged in" : "You are not logged in"} </p>;
};

export const dynamic = "force-dynamic";
export default Auth;
