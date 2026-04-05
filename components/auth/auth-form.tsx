"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthFormProps = {
  form: any;
  onSubmit: (values: any) => void;
  loading: boolean;
  type: "login" | "register";
};

const AuthForm = ({ form, onSubmit, loading, type }: AuthFormProps) => {
  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>{type === "login" ? "Login" : "Create account"}</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {type === "register" && (
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

            {type === "register" && (
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
              {loading
                ? "Loading..."
                : type === "login"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
