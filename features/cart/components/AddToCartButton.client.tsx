"use client";
import { toast } from "sonner";
import { useState } from "react";
import { addToCart } from "../actions";
import { Button } from "@/components/ui/button";


// client actions > add toast

type ClientAddToCartProps = { productId: string };

const ClientAddToCart = ({ productId }: ClientAddToCartProps) => {
  const [onAction, setOnAction] = useState(false);

  const handleAdd = async () => {
    setOnAction(true);

    const id = toast.loading("Adding to cart ...", {
      position: "top-center",
    });

    const options = {
      id,
      position: "top-center",
    } as const;

    await addToCart(productId)
      .then(() => toast.success("Added to cart", options))
      .catch((err: any) => {
        if (err?.digest?.includes("NEXT_REDIRECT")) {
          toast.warning("Please login first", options);
        } else {
          toast.error("Failed to add item", options);
        }
      })
      .finally(() => setOnAction(false));
  };

  return (
    <Button
      type="button"
      variant={onAction ? "default" : "destructive"}
      disabled={onAction}
      onClick={handleAdd}
      className="opacity-70 hover:scale-[1.02] transition-transform duration-300"
    >
      add to cart
    </Button>
  );
};

export { ClientAddToCart };
