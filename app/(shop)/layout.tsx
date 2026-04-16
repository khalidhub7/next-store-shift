import { cookies } from "next/headers";
import { getCart } from "@/lib/db/cart";
import CartDialog from "../../components/cart/CartDialog";

const ShopLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart")?.value;

  let cart;

  try {
    if (!cartId) throw new Error();
    cart = await getCart(cartId);
  } catch (error) {}

  return (
    <>
      <CartDialog />
      {children}
    </>
  );
};

export default ShopLayout;
