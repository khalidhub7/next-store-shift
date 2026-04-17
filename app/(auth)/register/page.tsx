import { Metadata } from "next";
import { AuthForm } from "@/features/auth";

export const metadata: Metadata = { title: "Register" };

const RegisterPage = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <AuthForm type="register" />
  </div>
);

export default RegisterPage;
