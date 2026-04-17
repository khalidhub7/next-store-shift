import { Metadata } from "next";
import { AuthForm } from "@/features/auth";


export const metadata: Metadata = { title: "Login" };

const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <AuthForm type="login" />
  </div>
);

export default LoginPage;
