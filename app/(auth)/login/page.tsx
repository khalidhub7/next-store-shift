import AuthForm from "@/components/auth/auth-form";
import { loginAction } from "@/actions/auth";

// always render fresh (no caching)
export const dynamic = "force-dynamic";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm type="login"/>
    </div>
  );
}

export default LoginPage