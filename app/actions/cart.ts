"use server";

import { cookies } from "next/headers";
import { Product } from "@/types/product";

interface CartItem {
  id: number;
  title: string;
  price: number;
  qty: number;
}

// interface Cart {}

/*  todo:
read and understand what happen 
then handle appCookies agent with best practices
*/

const reloadCart = async (): Array<CartItem> => {
  const appCookies = await cookies();
  const cart = appCookies.get("cart");
  return cart ? JSON.parse(cart.value) : [];
};

const addToCart = (product: Product) => {
  let newCart: Array<CartItem>;
  const cart = reloadCart();
  const isExist = cart.find((i) => i.id === product.id);

  if (isExist) {
    newCart = cart.map((p) => {
      const { id, title, price, qty } = isExist;
      return p.id === id ? { id, title, price, qty: qty + 1 } : p;
    });
  } else {
    const { id, title, price } = product;
    newCart = [...cart, { id, title, price, qty: 1 }];
  }
};
