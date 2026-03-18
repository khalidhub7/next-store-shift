// client actions allow toast

"use client";
import { toast } from "sonner";
import { CartItem } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOptimistic, useRef, useState } from "react";
import { addToCart, decreaseQty } from "@/app/actions/cart";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Plus, Minus, MoreHorizontalIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { removeFromCart, updateQty, increaseQty } from "@/app/actions/cart";

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
    const id = toast.loading("Adding to cart ... ", {
      position: "top-center",
    });

    try {
      await addToCart(productId);
      toast.success("Added to cart", {
        id,
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to add item", {
        id,
        position: "top-center",
      });
    }
  };

  return (
    <Button
      type="button"
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

  const handleUpdateQty = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const prev = newQty;
    const value = Number(e.target.value);

    setNewQty(value);

    const id = toast.loading("Saving ... ", {
      position: "top-center",
    });

    const options = { id, position: "top-center" } as const;

    try {
      await updateQty(productId, value);
      toast.success("Quantity updated", options);
      oldValue.current = value;
    } catch {
      setNewQty(prev);
      toast.error("Update failed", options);
    }
  };

  return (
    <TableCell>
      <Input
        type="number"
        value={newQty}
        onBlur={handleUpdateQty}
        onChange={(e) => setNewQty(Number(e.target.value))}
      ></Input>
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
    const id = toast.loading("Updating ... ", {
      position: "top-center",
      duration: 300,
    });
    const options = { id, position: "top-center", duration: 300 } as const;

    try {
      await increaseQty(productId);
      toast.success("+1 added", options);
    } catch {
      setOptimisticCart(prev);
      toast.error("Couldn't increase", options);
    }
  };

  const handleDecrease = async (productId: string) => {
    const prev = optimisticCart;

    setOptimisticCart((state) =>
      state.map((p) => (p.id === productId ? { ...p, qty: p.qty - 1 } : p)),
    );

    const id = toast.loading("Updating ... ", {
      position: "top-center",
      duration: 300,
    });

    const options = { id, position: "top-center", duration: 300 } as const;

    try {
      await decreaseQty(productId);
      toast.success("-1 removed", options);
    } catch {
      setOptimisticCart(prev);
      toast.error("Couldn't decrease", options);
    }
  };

  const handleRemove = async (productId: string) => {
    const prev = optimisticCart;

    setOptimisticCart((state) => state.filter((item) => item.id !== productId));

    const id = toast.loading("Removing ... ", {
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
        {optimisticCart.map((item: CartItem) => (
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
