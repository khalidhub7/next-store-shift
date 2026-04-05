import AuthForm from "@/components/auth/auth-form";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Register" };

const RegisterPage = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <AuthForm type="register" />
  </div>
);

export default RegisterPage;
