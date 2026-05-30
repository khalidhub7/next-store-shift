import { CartDialog } from "@/features/cart";

const ShopLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <CartDialog /> {children}
    </>
  );
};

export default ShopLayout;
