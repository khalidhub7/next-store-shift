import {
  DialogHeader,
  DialogTrigger,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
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
import { MoreHorizontalIcon, Plus, Minus } from "lucide-react";
import Image from "next/image";
import reloadCart from "@/lib/reloadCart";
import { CartItem } from "@/types/product";
import { ClientDecreaseQty } from "./ClientActions";

const CartDialog = async () => {
  const { cart } = await reloadCart();

  // console.log(JSON.stringify(cart))
  return (
    /* cart dialog */
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label="Open cart"
          variant="ghost"
          size="icon-lg"
          className="p-1 fixed right-3 top-14"
        >
          <Image
            src="https://img.icons8.com/?size=100&id=8384&format=png&color=000000"
            alt="basket"
            width={50}
            height={50}
          ></Image>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cart</DialogTitle>
          <DialogDescription>Easily manage your cart.</DialogDescription>
        </DialogHeader>

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
                <TableCell>{item.qty}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Plus className="mr-2" />
                        Increase
                      </DropdownMenuItem>

                      <ClientDecreaseQty product={data} />

                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;
