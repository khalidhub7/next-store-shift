import CartDialog from "../../components/cart/CartDialog";

const ShopLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <CartDialog />
    {children}
  </>
);

export default ShopLayout;
