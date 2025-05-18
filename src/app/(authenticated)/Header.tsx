"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationsDropdown from '../components/NotificationsDropdown';
import { NotificationType } from '../../lib/notifications';
import { FiCompass, FiTrendingUp, FiEdit, FiUser, FiBell, FiLogOut } from 'react-icons/fi';

// Lägg till prop:
interface HeaderProps {
  onSearchIconClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchIconClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; profileImage: string }>({ name: '', profileImage: '' });
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Använd useNotifications-hook för att hantera notifikationer
  const { 
    notifications, 
    loading: notificationsLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isRealtimeConnected,
    refetch
  } = useNotifications();

  // Endast ladda notifikationer när användaren klickar på notifikationsikonen
  const handleNotificationsClick = () => {
    // Alltid hämta nya notifikationer när ikonen klickas
    refetch();
    
    // Växla visning av notifikationer
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name || '', profileImage: data.profileImage || '' });
        }
      } catch (error) {
        console.error('Fel vid hämtning av användare:', error);
      }
    };
    fetchUser();

    // Lyssna på scroll för att ändra header-utseende
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stäng notifikationsdropdown när användaren klickar utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        showNotifications && 
        !target.closest('.notifications-dropdown') && 
        !target.closest('.notifications-button')
      ) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Utloggning misslyckades");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-transparent bg-opacity-80 backdrop-blur-lg shadow-2xl opacity-90'
          : 'bg-transparent bg-opacity-100 opacity-100'}
        h-20 md:h-18 flex items-center`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
        <div className="flex justify-between h-20 md:h-24 items-center">
          <div className="flex items-center">
            <Link 
              href="/home" 
              className="flex items-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-300 hover:to-purple-400 transition"
            >
              <span className="text-2xl mr-1">✦</span> CryptoTalk
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                href="/explore" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive('/explore') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center">
                  <FiCompass className="h-4 w-4 mr-1" />
                  Utforska
                </span>
              </Link>
              <Link 
                href="/crypto-news" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive('/crypto-news') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center">
                  <FiTrendingUp className="h-4 w-4 mr-1" />
                  Crypto News
                </span>
              </Link>
              <Link 
                href="/post" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive('/post') 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center">
                  <FiEdit className="h-4 w-4 mr-1" />
                  Skapa inlägg
                </span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button 
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 focus:outline-none"
                onClick={onSearchIconClick}
              >
                <span className="sr-only">Sök</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Notifikationsklocka med dropdown */}
              <div className="relative notifications-dropdown">
                <button 
                  className={`p-2 rounded-full transition-all duration-200 focus:outline-none notifications-button ${
                    showNotifications ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  onClick={handleNotificationsClick}
                >
                  <span className="sr-only">Visa notifikationer</span>
                  <FiBell className="h-5 w-5" />
                  
                  {/* Indikator för nya notifikationer */}
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifikationsdropdown */}
                {showNotifications && (
                  <NotificationsDropdown 
                    notifications={notifications}
                    loading={notificationsLoading}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    isRealtimeConnected={isRealtimeConnected}
                  />
                )}
              </div>
              
              {/* Profilmeny med hover-effekter */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/profile" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                      isActive('/profile') 
                        ? 'text-white bg-blue-600' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=384d7c&color=fff`}
                      alt="Profilbild"
                      className="h-8 w-8 rounded-full object-cover bg-gray-700 border border-gray-600 transition-transform hover:scale-105"
                    />
                    <span className="text-sm font-medium">{user.name || 'Min profil'}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="btn-hover-effect text-sm text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-all flex items-center gap-2"
                  >
                    Logga ut
                    <FiLogOut className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobilmeny-knapp med förbättrade hover och fokuseffekter */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all"
              >
                <span className="sr-only">{isMenuOpen ? 'Stäng meny' : 'Öppna meny'}</span>
                <svg 
                  className={`h-6 w-6 transition-opacity duration-200 ${isMenuOpen ? 'opacity-0 absolute' : 'opacity-100'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`h-6 w-6 transition-opacity duration-200 ${isMenuOpen ? 'opacity-100' : 'opacity-0 absolute'}`} 
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

        {/* Mobilmeny med smidigare animationer */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 rounded-lg shadow-lg my-2">
            <Link 
              href="/explore" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/explore') ? 'text-white bg-blue-600' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
            >
              <FiCompass className="h-4 w-4 mr-1" />
              Utforska
            </Link>
            <Link 
              href="/crypto-news" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/crypto-news') ? 'text-white bg-blue-600' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
            >
              <FiTrendingUp className="h-4 w-4 mr-1" />
              Crypto News
            </Link>
            <Link 
              href="/post" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/post') ? 'text-white bg-blue-600' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
            >
              <FiEdit className="h-4 w-4 mr-1" />
              Skapa inlägg
            </Link>
            <Link 
              href="/profile" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile') ? 'text-white bg-blue-600' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
            >
              Min profil
            </Link>
            <Link 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setShowNotifications(true);
                setIsMenuOpen(false);
              }}
              className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <FiBell className="h-5 w-5" />
              Notifikationer
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              Logga ut
              <FiLogOut className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 