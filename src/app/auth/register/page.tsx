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
      setError("Lösenorden matchar inte");
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
        throw new Error(data.message || "Något gick fel");
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Bakgrundsanimation */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="w-full max-w-md p-8 bg-black/80 rounded-2xl shadow-2xl relative z-10 border border-blue-900/30 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Skapa konto på CryptoTalk
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-2 text-center">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="E-postadress"
            className="w-full px-0 py-3 bg-transparent text-white border-0 border-b border-white focus:border-blue-500 focus:ring-0 placeholder-gray-400 transition"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Lösenord"
            className="w-full px-0 py-3 bg-transparent text-white border-0 border-b border-white focus:border-blue-500 focus:ring-0 placeholder-gray-400 transition"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Bekräfta lösenord"
            className="w-full px-0 py-3 bg-transparent text-white border-0 border-b border-white focus:border-blue-500 focus:ring-0 placeholder-gray-400 transition"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition"
          >
            Skapa konto
          </button>
        </form>
        <div className="text-center mt-6">
          <span className="text-gray-400">Har du redan ett konto?</span>
          <Link href="/" className="ml-2 text-blue-400 hover:underline font-semibold">
            Logga in
          </Link>
        </div>
      </div>
    </div>
  );
}
