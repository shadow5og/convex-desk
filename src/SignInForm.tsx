import { useAuthActions } from "@convex-dev/auth/react";
import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { mutate: login } = useLogin();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async (type: string, data?: any) => {
      setSubmitting(true);
      try {
          await signIn(type, data);
          // Trigger Refine's login update
          login({});
          // Explicitly navigate to dashboard
          navigate("/");
      } catch (error: any) {
          let toastTitle = "";
          if (error.message.includes("Invalid password")) {
            toastTitle = "Invalid password. Please try again.";
          } else {
            toastTitle =
              flow === "signIn"
                ? "Could not sign in, did you mean to sign up?"
                : "Could not sign up, did you mean to sign in?";
          }
          toast.error(toastTitle);
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          handleSignIn("password", formData);
        }}
      >
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          autoComplete="email"
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoComplete="current-password"
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-6">
        <div className="h-px grow bg-border" />
        <span className="mx-4 text-xs uppercase text-muted-foreground font-medium">or</span>
        <div className="h-px grow bg-border" />
      </div>
      <Button 
        variant="outline" 
        className="w-full" 
        disabled={submitting}
        onClick={() => handleSignIn("anonymous")}
      >
        Sign in anonymously
      </Button>
    </div>
  );
}
