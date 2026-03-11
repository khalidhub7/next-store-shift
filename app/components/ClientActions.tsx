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
type CompType = "products" | "cart";

const ClientAddToCart = ({
  productId,
  compType = "products",
}: {
  productId: string;
  compType: CompType;
}) => {
  const handleAdd = async () => {
    await addToCart(productId);
    toast.success("Product added successfully.", { position: "top-center" });
  };

  return compType === "products" ? (
    <Button
      variant="destructive"
      className="opacity-70 hover:scale-[1.02] transition-transform duration-300"
      onClick={handleAdd}
    >
      add to cart
    </Button>
  ) : (
    <DropdownMenuItem onClick={handleAdd}>
      <Plus className="mr-2" />
      inc
    </DropdownMenuItem>
  );
};

// cartDialog dropdown actions
const ClientDecreaseQty = ({ productId }: { productId: string }) => {
  const handleDecreaseQty = async () => {
    await decreaseQty(productId);
    toast.success("Product added successfully.", { position: "top-center" });
  };

  return (
    <DropdownMenuItem onClick={handleDecreaseQty}>
      <Minus className="mr-2" />
      Decrease
    </DropdownMenuItem>
  );
};

export { ClientAddToCart, ClientDecreaseQty };
