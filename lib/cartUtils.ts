import { CartItem } from "@/types/product";

const addToCartLogic = (
  cart: CartItem[],
  product: { id: string; title: string; price: number },
) => {
  const foundProduct = cart.find((i) => i.id === product.id);

  if (foundProduct) {
    return cart.map((p) =>
      p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
    );
  }

  return [
    ...cart,
    { id: product.id, title: product.title, price: product.price, qty: 1 },
  ];
};

const increaseQtyLogic = (cart: CartItem[], productId: string) => {
  return cart.map((item) =>
    item.id === productId ? { ...item, qty: item.qty + 1 } : item,
  );
};

const decreaseQtyLogic = (cart: CartItem[], productId: string) => {
  return cart
    .map((item) =>
      item.id === productId ? { ...item, qty: item.qty - 1 } : item,
    )
    .filter((item) => item.qty > 0);
};

const removeFromCartLogic = (cart: CartItem[], productId: string) => {
  return cart.filter((item) => item.id !== productId);
};

const updateQtyLogic = (cart: CartItem[], productId: string, qty: number) => {
  return cart.map((item) => (item.id === productId ? { ...item, qty } : item));
};

export {
  addToCartLogic,
  increaseQtyLogic,
  decreaseQtyLogic,
  removeFromCartLogic,
  updateQtyLogic,
};
