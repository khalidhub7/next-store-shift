import { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/features/auth";
import { AuthFormSkeleton } from "@/features/auth";

export const metadata: Metadata = { title: "Login" };

const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthForm type="login" />
    </Suspense>
  </div>
);

export default LoginPage;
