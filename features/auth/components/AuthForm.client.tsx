"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";
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
      let resolved = false;
      if (isLogin) {
        const { success, rateLimit, message } = await loginAction(
          values as LoginData,
        );
        if (success) resolved = true;
        if (rateLimit) {
          toast.error(message, options);
          return; // stop here
        }
        success
          ? toast.success(message, options)
          : toast.error(message, options);
      } else {
        const { success, message } = await registerAction(
          values as RegisterData,
        );
        if (success) resolved = true;
        success
          ? toast.success(message, options)
          : toast.error(message, options);
      }

      if (resolved) {
        const safeRedirects = ["/products"];
        const redirectTo = searchParams.get("redirect");

        router.replace(
          redirectTo && safeRedirects.includes(redirectTo) ? redirectTo : "/",
        );
      }
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
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-4"
              >
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
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
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
              </motion.div>
            </AnimatePresence>
            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Sign up"
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link
                href={{
                  pathname: isLogin ? "/register" : "/login",
                  query: Object.fromEntries(searchParams),
                }}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export { AuthForm };
