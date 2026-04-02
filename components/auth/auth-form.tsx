"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form, FormField, FormItem, FormMessage
} from "@/components/ui/form"

import { loginSchema, registerSchema } from "@/lib/validators/auth"
import { z } from "zod"

type AuthFormProps =
  | { type: "login" }
  | { type: "register" }

export function AuthForm({ type }: AuthFormProps) {
  const schema = type === "login" ? loginSchema : registerSchema

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "", confirmPassword: "" },
  })

  const [loading, setLoading] = useState(false)

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setLoading(true)

      // 👉 replace with your API / server action
      console.log(values)

    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>
          {type === "login" ? "Login" : "Create account"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
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
  )
}