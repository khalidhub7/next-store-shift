"use client";
import { toast } from "sonner";
import { CartItem } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { removeFromCart, updateQty } from "../../actions/cart";
import { Plus, Minus, MoreHorizontalIcon } from "lucide-react";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { addToCart, decreaseQty, increaseQty } from "../../actions/cart";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// client actions > add toast

type ClientAddToCartProps = { productId: string };
type ClientUpdateQtyProps = { productId: string; qty: number };

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
      .catch(() => toast.error("Failed to add item", options))
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

// cartDialog dropdown actions

const ClientUpdateQty = ({ productId, qty }: ClientUpdateQtyProps) => {
  // qty prop: is always the last server value

  const [newQty, setNewQty] = useState(qty);

  useEffect(() => {
    setNewQty(qty); // update qty in ui if the inc/dec triggered
  }, [qty]);

  const handleUpdateQty = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    setNewQty(value);

    const id = toast.loading("Saving ...", {
      position: "top-center",
    });

    const options = {
      id,
      position: "top-center",
    } as const;

    await updateQty(productId, value)
      .then(() => toast.success("Quantity updated", options))
      .catch(() => {
        toast.error("Update failed", options);
        setNewQty(qty);
      });
  };

  return (
    <TableCell>
      <Input
        type="number"
        value={newQty}
        onBlur={handleUpdateQty}
        onChange={(e) => setNewQty(Number(e.target.value))}
      />
    </TableCell>
  );
};

// rule: use optimistic just when value comes from server props

const ClientCartTable = ({ cart }: { cart: Array<CartItem> }) => {
  const [optimisticCart, setOptimisticCart] = useOptimistic(cart);

  const [, startTransition] = useTransition();

  // event handlers

  const handleIncrease = (productId: string) => {
    startTransition(async () => {
      // update ui immediately with fake data
      setOptimisticCart((state) =>
        state.map((p) => (p.id === productId ? { ...p, qty: p.qty + 1 } : p)),
      );

      const id = toast.loading("Updating ...", {
        position: "top-center",
        duration: 300,
      });

      const options = {
        id,
        position: "top-center",
        duration: 300,
      } as const;

      await increaseQty(productId)
        .then(() => toast.success("+1 added", options))
        .catch(() => toast.error("Couldn't increase", options));
    });
  };

  const handleDecrease = (productId: string) => {
    startTransition(async () => {
      setOptimisticCart((state) =>
        state.map((p) => (p.id === productId ? { ...p, qty: p.qty - 1 } : p)),
      );

      const id = toast.loading("Updating ...", {
        position: "top-center",
        duration: 300,
      });

      const options = {
        id,
        position: "top-center",
        duration: 300,
      } as const;

      await decreaseQty(productId)
        .then(() => toast.success("-1 removed", options))
        .catch(() => toast.error("Couldn't decrease", options));
    });
  };

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      setOptimisticCart((state) =>
        state.filter((item) => item.id !== productId),
      );

      const id = toast.loading("Removing ...", {
        position: "top-center",
        duration: 300,
      });

      const options = {
        id,
        position: "top-center",
        duration: 300,
      } as const;

      await removeFromCart(productId)
        .then(() => toast.success("Item removed", options))
        .catch(() => toast.error("Couldn't remove item", options));
    });
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
            <TableCell className="font-medium text-purple-400">
              {item.title}
            </TableCell>

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
                    <Plus className="mr-2" />
                    inc
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
