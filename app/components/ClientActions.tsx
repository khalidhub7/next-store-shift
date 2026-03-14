// client actions allow toast

"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  addToCart,
  decreaseQty,
  removeFromCart,
  updateQty,
} from "@/app/actions/cart";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, Minus } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

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
      <Plus className="mr-2" /> inc
    </DropdownMenuItem>
  );
};

// cartDialog dropdown actions
const ClientDecreaseQty = ({ productId }: { productId: string }) => {
  const handleDecreaseQty = async () => {
    await decreaseQty(productId);
    toast.success("Product Decrease successfully.", {
      position: "bottom-right",
    });
  };

  return (
    <DropdownMenuItem onClick={handleDecreaseQty}>
      <Minus className="mr-2" />
      dec
    </DropdownMenuItem>
  );
};

const ClientRemoveFromCart = ({ productId }: { productId: string }) => {
  const handleRemoveFromCart = async () => {
    await removeFromCart(productId);
    toast.success("Product removed successfully.", {
      position: "bottom-right",
    });
  };

  return (
    <DropdownMenuItem variant="destructive" onClick={handleRemoveFromCart}>
      Delete
    </DropdownMenuItem>
  );
};

type ClientUpdateQtyProps = {
  productId: string;
  qty: number;
};

const ClientUpdateQty = ({ productId, qty }: ClientUpdateQtyProps) => {
  const oldValue = useRef(qty);
  const [newQty, setNewQty] = useState(qty);

  const handleUpdateQty = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setNewQty(newValue); // update UI immediately

    await updateQty(productId, newValue)
      .then(() => {
        toast.success("Qty updated", {
          position: "bottom-right",
        });
        oldValue.current = newValue;
      })
      .catch(async () => {
        toast.success("Qty Update failed", {
          position: "bottom-right",
        });
        await updateQty(productId, Number(oldValue));
      });
  };

  return (
    <TableCell>
      <Input type="number" value={newQty} onChange={handleUpdateQty}></Input>
    </TableCell>
  );
};

export {
  ClientAddToCart,
  ClientDecreaseQty,
  ClientRemoveFromCart,
  ClientUpdateQty,
};
