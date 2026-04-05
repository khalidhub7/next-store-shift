"use client";

import { useForm } from "react-hook-form";
import AuthForm from "@/components/auth/auth-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterData } from "@/lib/validators/auth";
import { useState } from "react";
import { registerAction } from "@/actions/auth";

export const dynamic = "force-dynamic";

const RegisterPage = () => {
  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: RegisterData) => {
    try {
      setLoading(true);
      await registerAction(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm
        type="register"
        form={form}
        onSubmit={onSubmit}
        loading={loading}
      />
    </div>
  );
};

export default RegisterPage;
