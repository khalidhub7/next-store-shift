// client actions allow toast

"use client";

import { toast } from "sonner";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  addToCart,
  decreaseQty,
  removeFromCart,
  updateQty,
} from "@/app/actions/cart";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, Minus } from "lucide-react";

// shared action between products/:id and cartDialog
// used to add product or increase qty
const ClientAddToCart = ({ product }: { product: Product }) => {
  const handleAdd = async () => {
    await addToCart(product);
    toast.success("Product added successfully.", { position: "top-center" });
  };

  return (
    <Button
      variant="destructive"
      className="opacity-70 hover:scale-[1.02] transition-transform duration-300"
      onClick={handleAdd}
    >
      add to cart
    </Button>
  );
};

// cartDialog actions

const ClientDecreaseQty = ({ product }: { product: Product }) => {
  const handleDecreaseQty = async () => {
    await decreaseQty(product);
    toast.success("Product Decrease successfully.", {
      position: "bottom-right",
    });
  };

  return (
    <DropdownMenuItem onClick={handleDecreaseQty}>
      <Minus className="mr-2" />
      Decrease
    </DropdownMenuItem>
  );
};

export { ClientAddToCart, ClientDecreaseQty };
