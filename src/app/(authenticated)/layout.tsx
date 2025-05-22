"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChatbotWrapper from '../components/ChatbotWrapper';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Lägg till en scroller-to-top knapp när användaren scrollar ner
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Funktion för att scrollta till toppen
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className="min-h-screen flex flex-col bg-[#181a20] text-white">
      {/* Header-komponenten läggs till i varje barnsida istället för här för att undvika dubbla headers */}

      {/* Huvudinnehåll */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Sidfot */}
      <footer className="bg-transparent border-t border-gray-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link 
                href="/explore" 
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 inline-block"
              >
                Multi-Blog
              </Link>
              <p className="text-gray-400 text-sm mt-2 max-w-md">
                Multi-Blog är en plattform för att dela tankar, idéer och inspirera andra. 
                Vårt mål är att skapa en gemenskap där kreativitet kan frodas.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-medium mb-2">Navigation</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/explore" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Utforska
                    </Link>
                  </li>
                  <li>
                    <Link href="/post" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Skapa inlägg
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Min profil
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Hjälp</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Om oss
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Kontakt
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Vanliga frågor
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <h3 className="text-white font-medium mb-2">Juridiskt</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Integritetspolicy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Användarvillkor
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Multi-Blog. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll-to-top knapp */}
      <button 
        onClick={scrollToTop}
        className={`fixed right-6 bottom-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <ChatbotWrapper />
    </div>
  );
} 