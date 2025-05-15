"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; profileImage: string }>({ name: '', profileImage: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        setUser({ name: data.name || '', profileImage: data.profileImage || '' });
      }
    };
    fetchUser();
  }, []);

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
    <header className="bg-black border-b border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/explore" className="text-xl font-bold text-blue-400 hover:text-blue-300 transition">
              Multi-Blog
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/explore" className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition">
                Utforska
              </Link>
              <Link href="/post" className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition">
                Skapa inlägg
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Sökknapp */}
              <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500">
                <span className="sr-only">Sök</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {/* Notifikationsklocka */}
              <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500">
                <span className="sr-only">Visa notifikationer</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {/* Profilmeny */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <Link href="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt="Profilbild"
                      className="h-8 w-8 rounded-full object-cover bg-gray-700 border border-gray-600"
                    />
                    <span className="text-sm font-medium">{user.name || 'Min profil'}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition"
                  >
                    Logga ut
                  </button>
                </div>
              </div>
            </div>
            {/* Mobilmeny-knapp */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">{isMenuOpen ? 'Stäng meny' : 'Öppna meny'}</span>
                <svg 
                  className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobilmeny */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
            <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900">
              Utforska
            </Link>
            <Link href="/post" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              Skapa inlägg
            </Link>
            <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              Min profil
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 