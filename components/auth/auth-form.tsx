"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction, registerAction } from "@/actions/auth";
import { loginSchema, LoginData } from "@/lib/validators/auth";
import { registerSchema, RegisterData } from "@/lib/validators/auth";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { type: "login" | "register" };

const AuthForm = ({ type }: Props) => {
  const isLogin = type === "login";

  const form = useForm<LoginData | RegisterData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: LoginData | RegisterData) => {
    try {
      setLoading(true);
      if (isLogin) await loginAction(values as LoginData);
      else await registerAction(values as RegisterData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? "Login" : "Create account"}</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Input placeholder="Name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Input type="email" placeholder="Email" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Input type="password" placeholder="Password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isLogin && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "" : isLogin ? "Sign in" : "Sign up"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
