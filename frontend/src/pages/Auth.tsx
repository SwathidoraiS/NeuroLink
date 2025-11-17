import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Brain, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { API_BASE_URL } from "../config";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.safeParse({
        email,
        password,
        name: isLogin ? undefined : name,
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const endpoint = isLogin
        ? `${API_BASE_URL}/api/auth/login`
        : `${API_BASE_URL}/api/auth/register`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isLogin ? undefined : name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Something went wrong");

      // ✅ Save token & user (only for login)
      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin
          ? "Successfully logged in to your Cognitive Twin."
          : "Your Cognitive Twin has been created successfully!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <Card className="glass-card border-white/10 p-8 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <Brain className="h-16 w-16 text-primary animate-glow" />
            <div className="absolute inset-0 blur-xl bg-primary/50" />
          </div>
        </div>

        <h1 className="text-3xl font-heading font-bold text-center mb-2">
          {isLogin ? "Welcome Back" : "Create Your Cognitive Twin"}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {isLogin
            ? "Access your digital cognitive companion"
            : "Begin your journey with NeuroLink"}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass border-white/20 focus:border-primary bg-white/5"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email
            </label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass border-white/20 focus:border-primary bg-white/5"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass border-white/20 focus:border-primary bg-white/5"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 glow-primary"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Access Twin"
              : "Create Twin"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? (
              <>
                New here?{" "}
                <span className="text-primary font-semibold">
                  Create your Cognitive Twin →
                </span>
              </>
            ) : (
              <>
                Already have a twin?{" "}
                <span className="text-primary font-semibold">Login →</span>
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
