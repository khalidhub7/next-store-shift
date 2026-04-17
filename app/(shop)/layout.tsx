import { CartDialog } from "@/features/cart";
import { getCartItems } from "@/features/cart";


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
