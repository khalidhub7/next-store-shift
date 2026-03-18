// client actions allow toast

"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  addToCart,
  decreaseQty,
  removeFromCart,
  updateQty,
  increaseQty,
} from "@/app/actions/cart";
import { Plus, Minus, MoreHorizontalIcon } from "lucide-react";
import { useOptimistic, useRef, useState } from "react";
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

type ClientUpdateQtyProps = {
  productId: string;
  qty: number;
};
type ClientAddToCartProps = {
  productId: string;
};

const ClientAddToCart = ({ productId }: ClientAddToCartProps) => {
  const handleAdd = async () => {
    await addToCart(productId);
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

// cartDialog dropdown actions

const ClientUpdateQty = ({ productId, qty }: ClientUpdateQtyProps) => {
  const oldValue = useRef(qty);
  const [newQty, setNewQty] = useState(qty);

  const handleUpdateQty = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const prev = newQty;
  const value = Number(e.target.value);

  setNewQty(value);

  const id = toast.loading("Updating quantity...", {
    position: "top-center",
  });

  const options = { id, position: "top-center" } as const;

  try {
    await updateQty(productId, value);
    toast.success("Quantity updated", options);
    oldValue.current = value;
  } catch {
    setNewQty(prev);
    toast.error("Couldn't update quantity", options);
  }
};

  return (
    <TableCell>
      <Input type="number" value={newQty} onChange={handleUpdateQty}></Input>
    </TableCell>
  );
};

const ClientCartTable = ({ cart }: { cart: Array<CartItem> }) => {
  const [optimisticCart, setOptimisticCart] = useOptimistic(cart);

  const handleIncrease = async (productId: string) => {
    const prev = optimisticCart;
    setOptimisticCart((state) =>
      state.map((p) => (p.id === productId ? { ...p, qty: p.qty + 1 } : p)),
    );
    const id = toast.loading("Increasing quantity...", {
      position: "top-center",
      duration: 300,
    });
    const options = { id, position: "top-center", duration: 300 } as const;

    try {
      await increaseQty(productId);
      toast.success("Quantity increased", options);
    } catch {
      setOptimisticCart(prev);
      toast.error("Couldn't increase quantity", options);
    }
  };

  const handleDecrease = async (productId: string) => {
    const prev = optimisticCart;

    setOptimisticCart((state) =>
      state.map((p) => (p.id === productId ? { ...p, qty: p.qty - 1 } : p)),
    );

    const id = toast.loading("Decreasing quantity...", {
      position: "top-center",
      duration: 300,
    });

    const options = { id, position: "top-center", duration: 300 } as const;

    try {
      await decreaseQty(productId);
      toast.success("Quantity decreased", options);
    } catch {
      setOptimisticCart(prev);
      toast.error("Couldn't decrease quantity", options);
    }
  };

  const handleRemove = async (productId: string) => {
    const prev = optimisticCart;

    setOptimisticCart((state) => state.filter((item) => item.id !== productId));

    const id = toast.loading("Removing item...", {
      position: "top-center",
      duration: 300,
    });

    const options = { id, position: "top-center", duration: 300 } as const;

    try {
      await removeFromCart(productId);
      toast.success("Item removed", options);
    } catch {
      setOptimisticCart(prev);
      toast.error("Couldn't remove item", options);
    }
  };

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
                  {/* inc */}
                  <DropdownMenuItem onClick={() => handleIncrease(item.id)}>
                    <Plus className="mr-2" /> inc
                  </DropdownMenuItem>
                  {/* dec */}
                  <DropdownMenuItem onClick={() => handleDecrease(item.id)}>
                    <Minus className="mr-2" />
                    dec
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  {/* rm */}
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleRemove(item.id)}
                  >
                    Delete
                  </DropdownMenuItem>
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
