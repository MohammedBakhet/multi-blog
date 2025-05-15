"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Logout failed");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Navigeringsfält */}
      {/* <header className="bg-black border-b border-gray-800 shadow-md"> ... </header> tas bort */}
      {/* Huvudinnehåll */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Sidfot */}
      <footer className="bg-black border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Multi-Blog. Alla rättigheter förbehållna.
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-gray-400 hover:text-white">
                Om oss
              </Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
                Integritetspolicy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
                Användarvillkor
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 