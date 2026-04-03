import Image from "next/image";
import { getCart } from "@/lib/db/cart";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { ClientCartTable } from "../client-parts/ClientActions";
import { DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DialogContent, DialogDescription } from "@/components/ui/dialog";

const CartDialog = async () => {
  const cookieStore = await cookies()
  const cartId = cookieStore.get("cart")?.value;
  const cartItems = cartId ? (await getCart(cartId)).items : [];


  // console.log(JSON.stringify(cart))
  return (
    /* cart dialog */
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label="Open cart"
          variant="ghost"
          size="icon-lg"
          className="p-1 fixed right-4 top-16 bg-white shadow-md rounded-full border border-gray-100 hover:shadow-lg transition-shadow duration-300"
        >
          <Image
            src="https://img.icons8.com/?size=100&id=8384&format=png&color=000000"
            alt="basket"
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

export default CartDialog;
