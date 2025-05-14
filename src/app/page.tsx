"use client";
import React, { useState } from "react";
import PublicFeed from "./components/PublicFeed";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      router.push("/explore");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left side: Blog feed, blue background */}
      <section className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-blue-700 to-blue-400 p-0 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80)' }} />
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
          <PublicFeed />
        </div>
      </section>
      {/* Right side: Auth actions, black background */}
      <section className="flex-1 flex flex-col justify-center items-center bg-black p-8 min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-4xl font-extrabold text-white mb-2 text-center">Happening Now</h2>
          <p className="text-xl text-white font-semibold mb-6 text-center">Join Multi-Blog today.</p>
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-700" />
            <span className="mx-4 text-gray-400"></span>
            <div className="flex-grow border-t border-gray-700" />
          </div>
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-700 rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="off"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-700 rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="off"
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition"
            >
              Sign in
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-gray-400">Don't have an account?</span>
            <a href="/auth/register" className="ml-2 text-blue-400 hover:underline font-semibold">Sign up</a>
          </div>
        </div>
      </section>
    </main>
  );
} 