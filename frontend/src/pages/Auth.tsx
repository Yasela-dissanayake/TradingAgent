import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Activity } from "lucide-react";
import { cn } from "../lib/utils";
import API_BASE from "../lib/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await axios.post(`${API_BASE}${endpoint}`, {
        email,
        password,
      });

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user.id);
        navigate("/dashboard");
      } else {
        setIsLogin(true); // Switch to login after successful register
        setError("Registration successful. Please log in.");
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "An error occurred";
      setError(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Activity className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-danger/20 border border-danger/50 text-danger text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition duration-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 rounded-lg font-medium transition duration-200 flex justify-center",
              loading
                ? "bg-primary/50 cursor-not-allowed text-white"
                : "bg-primary hover:bg-primary-dark text-slate-900",
            )}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
