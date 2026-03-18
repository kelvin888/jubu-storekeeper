"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Package, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginLeftBG from "../../../assets/img/login-left-bg.png";
import LoginRightBG from "../../../assets/img/login-right-bg.png";  

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/inventory");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — illustrated panel */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <Image
          src={LoginLeftBG}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right — login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* background image */}
        <Image
          src={LoginRightBG} 
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* overlay so text stays readable */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              StoreKeeper <span className="text-indigo-600">Pro</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Sign in to your account
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@storekeeper.com"
                required
                autoFocus
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs text-indigo-600 cursor-default">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or sign in with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl font-medium"
            disabled
          >
            Single Sign-On (SSO)
          </Button>
        </div>

        <p className="relative z-10 text-center text-xs text-gray-400 mt-10">
          StoreKeeper Pro v2.4 · Terminal Management System
        </p>
      </div>
    </div>
  );
}
