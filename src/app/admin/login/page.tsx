"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login successful!");
      router.push("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : error.code === "auth/user-not-found"
            ? "User not found"
            : error.code === "auth/wrong-password"
              ? "Incorrect password"
              : "Failed to login. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen primary-color-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold secondary-color-text mb-2">
              Admin Login
            </h1>
            <p className="secondary-color-text opacity-70">
              Sign in to manage your blog
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold secondary-color-text mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold secondary-color-text mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg secondary-color-bg primary-color-text font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="secondary-color-text opacity-70 hover:opacity-100 text-sm transition-opacity"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-sm text-center">
            Note: Make sure Email/Password authentication is enabled in your
            Firebase Console
          </p>
        </div>
      </div>
    </main>
  );
}
