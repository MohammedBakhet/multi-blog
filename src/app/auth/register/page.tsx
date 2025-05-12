"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-black rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Register a new account</h2>
        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-2 text-center">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-0 py-3 bg-transparent text-white border-0 border-b border-white focus:border-blue-500 focus:ring-0 placeholder-gray-400 transition"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-0 py-3 bg-transparent text-white border-0 border-b border-white focus:border-blue-500 focus:ring-0 placeholder-gray-400 transition"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-0 py-3 bg-transparent text-white border-0 border-b border-white focus:border-blue-500 focus:ring-0 placeholder-gray-400 transition"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-purple-700 transition"
          >
            Register
          </button>
        </form>
        <div className="text-center mt-6">
          <span className="text-gray-400">Already have an account?</span>
          <Link href="/" className="ml-2 text-blue-400 hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
