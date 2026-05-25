"use client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/server";


const LogoutButton = () => {
  const options = { position: "top-center" } as const;

  const logoutHandler = async () => {
    const obj = await logoutAction();

    obj.success
      ? toast.success(obj.message, options)
      : toast.error(obj.message, options);
  };

  return (
    <Button onClick={logoutHandler}>
      <LogOut size={18} />
    </Button>
  );
};

export { LogoutButton };
