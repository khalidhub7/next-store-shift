"use client";
import { toast } from "sonner";
import { CartItem } from "../types/cart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { increaseQty, decreaseQty } from "../actions";
import { removeFromCart, updateQty } from "../actions";
import { Plus, Minus, MoreHorizontalIcon } from "lucide-react";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// cartDialog dropdown actions

type ClientUpdateQtyProps = {
  productId: number;
  qty: number;
  onUpdate: (qty: number) => void;
  onRevert: () => void;
};

const ClientUpdateQty = ({
  productId,
  qty,
  onUpdate,
  onRevert,
}: ClientUpdateQtyProps) => {
  // qty prop: is always the last server value
  const [newQty, setNewQty] = useState(qty);

  console.log(`*** qty: ${qty} ***`);
  console.log(`*** newQty: ${newQty} ***`);

  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log("renderCount", renderCount.current);

  useEffect(() => {
    setNewQty(qty); // update qty in ui if the inc/dec triggered
  }, [qty]);

  const handleUpdateQty = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value === qty) return;

    setNewQty(value);
    onUpdate(value);

    const id = toast.loading("Saving ...", {
      position: "top-center",
    });

    const options = {
      id,
      position: "top-center",
    } as const;

    await updateQty(productId, value)
      .then(() => toast.success("Quantity updated", options))
      .catch((err) => {
        toast.error(err.message, options);
        setNewQty(qty);
        onRevert(); // tell parent to revert
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

  const handleIncrease = (productId: number) => {
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
        .then(() => {
          toast.success("+1 added", options);
        })
        .catch((err) => {
          toast.error("Couldn't increase", options);
          // throw err; // let React revert optimistic state
        });
    });
  };

  const handleDecrease = (productId: number) => {
    startTransition(async () => {
      setOptimisticCart((state) =>
        state
          .map((p) => (p.id === productId ? { ...p, qty: p.qty - 1 } : p))
          .filter((p) => p.qty > 0),
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
        .then(() => {
          toast.success("-1 removed", options);
        })
        .catch((err) => {
          toast.error("Couldn't decrease", options);
          // throw err;
        });
    });
  };

  const handleRemove = (productId: number) => {
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
        .then(() => {
          toast.success("Item removed", options);
        })
        .catch((err) => {
          toast.error("Couldn't remove item", options);
          // throw err;
        });
    });
  };

  const handleUpdateQty = (productId: number, qty: number) => {
    startTransition(async () => {
      setOptimisticCart((state) =>
        qty <= 0
          ? state.filter((p) => p.id !== productId)
          : state.map((p) => (p.id === productId ? { ...p, qty } : p)),
      );
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

            <ClientUpdateQty
              productId={item.id}
              qty={item.qty}
              onUpdate={(qty) => handleUpdateQty(item.id, qty)}
              onRevert={() => {
                startTransition(async () => {
                  setOptimisticCart((state) =>
                    state.map((p) =>
                      p.id === item.id ? { ...p, qty: item.qty } : p,
                    ),
                  );
                });
              }} // revert to original
            />

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

export { ClientCartTable };
