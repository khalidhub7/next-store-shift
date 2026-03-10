import CartDialog from "@/app/components/CartDialog";

const ShopLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <CartDialog />
    {children}
  </>
);

export default ShopLayout;
