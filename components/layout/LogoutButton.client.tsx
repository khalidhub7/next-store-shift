"use client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
/* import { logoutAction } from "@/features/auth/server"; */

const LogoutButton = () => {
  const options = { position: "top-center" } as const;
  const router = useRouter();

  const logoutHandler = async () => {
    const obj = await logoutAction();
    if (obj.success) {
      toast.success(obj.message, options);
      router.refresh();
    } else toast.error(obj.message, options);
  };

  return (
    <Button onClick={logoutHandler} variant={"ghost"} size={"icon-lg"}>
      <LogOut />
    </Button>
  );
};

export { LogoutButton };
