"use client";

import { toast } from "sonner";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/actions/cart";

const AddToCartButton = ({ product }: { product: Product }) => {
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

export default AddToCartButton;
