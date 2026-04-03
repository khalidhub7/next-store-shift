import { z } from "zod";

const authSchema = z
  .object({
    type: z.enum(["login", "register"]),

    name: z.string().min(2, "Name must be at least 2 characters").optional(),

    email: z.string().email("Invalid email address"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "register") {
      if (!data.name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is required",
          path: ["name"],
        });
      }

      if (!data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please confirm your password",
          path: ["confirmPassword"],
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }
  });

export { authSchema };
