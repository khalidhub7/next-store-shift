import { cookies } from "next/headers";

const reloadCart = async () => {
  const appCookies = await cookies();
  const request = appCookies.get("cart");
  const cart = request ? JSON.parse(request.value) : [];
  return { cart, appCookies };
};

export default reloadCart;
