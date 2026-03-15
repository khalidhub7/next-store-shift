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
import { Plus, Minus, MoreHorizontalIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CartItem } from "@/types/product";

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
        toast.error("Qty Update failed", {
          position: "bottom-right",
        });
        await updateQty(productId, oldValue.current);
      });
  };

  return (
    <TableCell>
      <Input type="number" value={newQty} onChange={handleUpdateQty}></Input>
    </TableCell>
  );
};

const ClientCartTable = ({ cart }: { cart: Array<CartItem> }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {cart.map((item: CartItem) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.price}</TableCell>
            <ClientUpdateQty productId={item.id} qty={item.qty} />

            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <ClientAddToCart compType="cart" productId={item.id} />
                  <ClientDecreaseQty productId={item.id} />

                  <DropdownMenuSeparator />
                  <ClientRemoveFromCart productId={item.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export { ClientAddToCart, ClientCartTable };
