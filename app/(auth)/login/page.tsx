"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthForm from "@/components/auth/auth-form";
import { loginSchema, LoginData } from "@/lib/validators/auth";
import { useState } from "react";
import { loginAction } from "@/actions/auth";

export const dynamic = "force-dynamic";

const LoginPage = () => {
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: LoginData) => {
    try {
      setLoading(true);
      await loginAction(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm
        type="login"
        form={form}
        onSubmit={onSubmit}
        loading={loading}
      />
    </div>
  );
};

export default LoginPage;
