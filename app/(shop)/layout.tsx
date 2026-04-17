import { getCartItems } from "@/features/cart/queries";
import { CartDialog } from "@/features/cart/components/CartDialog.client";


const ShopLayout = async ({ children }: { children: React.ReactNode }) => {
  const items = await getCartItems()
  return (
    <>
      <CartDialog cartItems={items} />
      {children}
    </>
  );
};

export default ShopLayout;
