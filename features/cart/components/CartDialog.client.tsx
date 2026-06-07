import Image from "next/image";
import { CartItem } from "../types/cart";
import { getCartItems } from "../queries";
import { Button } from "@/components/ui/button";
import { ClientCartTable } from "./CartTable.client";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DialogContent, DialogDescription } from "@/components/ui/dialog";

const CartDialog = async () => {
  const cartItems: Array<CartItem> = await getCartItems();
  // console.log(JSON.stringify(cart))
  return (
    /* cart dialog */
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label="Open cart"
          variant="ghost"
          size="icon-lg"
          className="
fixed right-6 top-20
size-12
p-2
rounded-full
border-4 border-taupe-300
bg-transparent
shadow-md
cursor-pointer
hover:shadow-lg hover:scale-110
transition-all duration-300
"
        >
          <Image
            src="/icons/shopping-cart-svgrepo-com.svg"
            alt="Cart"
            width={40}
            height={40}
          />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Your Cart
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Easily manage your cart.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <ClientCartTable cart={cartItems} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CartDialog };
