import { cookies } from "next/headers";

const reloadCart = async () => {
  try {
    const appCookies = await cookies();
    const cartCookie = appCookies.get("cart");
    const cart = cartCookie ? JSON.parse(cartCookie.value) : [];

    
    return { cart, appCookies };
  } catch (_) {
    throw new Error("failed to reload cart");
  }
};

export default reloadCart;

