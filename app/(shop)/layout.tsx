import { cookies } from "next/headers";
import { getCart } from "@/lib/db/cart";
import { CartItem } from "@/types/cart";
import { getSession } from "@/lib/db/session";
import CartDialog from "../../components/cart/CartDialog";

const ShopLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart")?.value;
  const sessionId = cookieStore.get("sessionId")?.value;

  let cartItems: Array<CartItem>;
  try {
    if (!sessionId || !cartId) throw new Error();
    const session = await getSession(sessionId);
    const cart = await getCart(cartId);
    if (!session || !cart) throw new Error();
    if (session.userId != cart.userId) throw new Error();
    cartItems = cart.items;
  } catch {
    cartItems = [];
  }

  return (
    <>
      <CartDialog cartItems={cartItems} />
      {children}
    </>
  );
};

export default ShopLayout;
