"use client";
import React, { useState, useEffect } from "react";
import PublicFeed from "./components/PublicFeed";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Något gick fel");
      router.push("/explore");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Vänster: Crypto feed, gradient och animation */}
      <section className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-0 md:p-8 relative overflow-hidden animate-fadeIn">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80)' }} />
        
        {/* Animerade cirklar i bakgrunden */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Crypto<span className="gradient-text">Talk</span>
            </h1>
            <p className="text-white text-opacity-90 text-lg max-w-md">
              Välkommen till CryptoTalk – Sveriges community för diskussioner om kryptovalutor, trender och blockchain! Dela dina tankar, följ marknaden och hitta likasinnade.
            </p>
          </div>
          <div className="w-full max-w-2xl animate-slideInUp">
            <PublicFeed />
          </div>
        </div>
      </section>
      
      {/* Höger: Auth actions, mörk bakgrund */}
      <section className="flex-1 flex flex-col justify-center items-center bg-black p-8 min-h-screen animate-fadeIn">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-2">
              <span className="gradient-text">Bli en del av CryptoTalk</span>
            </h2>
            <p className="text-xl text-white font-semibold mb-6">Gå med i Sveriges crypto-community idag.</p>
          </div>
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-700" />
            <span className="mx-4 text-gray-400"></span>
            <div className="flex-grow border-t border-gray-700" />
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded animate-fadeIn">
                {error}
              </div>
            )}
            
            <div className="group">
              <input
                type="email"
                placeholder="E-postadress"
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="off"
              />
            </div>
            
            <div className="group">
              <input
                type="password"
                placeholder="Lösenord"
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="off"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition-all btn-hover-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loggar in...
                </span>
              ) : "Logga in"}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <span className="text-gray-400">Har du inget konto?</span>
            <Link href="/auth/register" className="ml-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold">Registrera dig</Link>
          </div>
        </div>
      </section>
    </main>
  );
} 