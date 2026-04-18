"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, LoginData } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction, registerAction } from "../actions";
import { registerSchema, RegisterData } from "../schema";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { type: "login" | "register" };

const AuthForm = ({ type }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = type === "login";

  const config = {
    // resolver
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    // defaultValues
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" },
    // mode
    mode: "onChange" as const,
  };
  const form = useForm<LoginData | RegisterData>(config);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: LoginData | RegisterData) => {
    const options = { position: "top-center" } as const;
    try {
      setIsSubmitting(true);

      if (isLogin) await loginAction(values as LoginData);
      else await registerAction(values as RegisterData);

      toast.success(isLogin ? "Logged in" : "Account created", options);

      const redirectTo = searchParams.get("redirect");
      router.replace(redirectTo || "/");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isLogin
            ? "Login failed"
            : "Signup failed",
        options,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-sm mx-auto ">
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
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export { AuthForm };
