import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(4),
});
const registerSchema = z
  .object({
    name: z.string().min(5),
    email: z.string().email("invalid email"),
    password: z.string().min(4),
    confirmPassword: z.string().min(4),
  })
  .refine((obj) => obj.password === obj.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export { loginSchema, registerSchema };
export type { LoginData, RegisterData };