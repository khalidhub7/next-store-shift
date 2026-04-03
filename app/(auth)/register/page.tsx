import AuthForm from "@/components/auth/auth-form";
import { registerAction } from "@/actions/auth";

// always render fresh (no caching)
export const dynamic = "force-dynamic";

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm type="register"/>
    </div>
  );
};

export default RegisterPage;
