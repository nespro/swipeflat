"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

/**
 * Full-screen login gate — blocks access to the app until valid credentials are entered.
 * Auth state persists in localStorage so the user stays logged in across sessions.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: wait for client mount before checking auth
  if (!mounted) {
    if (typeof window !== "undefined") setMounted(true);
    return null;
  }

  if (isAuthenticated) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = login(username.trim(), password);
    if (!success) {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-brand" />
          </div>
          <h1 className="text-2xl font-bold">
            Swipe<span className="text-brand">Flat</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            This app is in private beta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(false);
              }}
              autoComplete="username"
              autoFocus
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-danger text-center">
              Invalid credentials
            </p>
          )}

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
