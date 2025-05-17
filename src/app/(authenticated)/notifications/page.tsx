'use client';

import React from 'react';
import NotificationsManager from '../../components/NotificationsManager';
import Header from '../Header';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden bg-[#181a20]">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start pt-24 relative z-10">
        <div className="w-full max-w-3xl p-8 border border-blue-900/30 rounded-2xl shadow-2xl bg-black/80 animate-fadeIn backdrop-blur-md">
          <h1 className="text-3xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Crypto-notifikationer
          </h1>
          <p className="text-gray-300 mb-6 text-center">
            Här ser du alla dina senaste händelser, svar och likes från crypto-communityn.<br />
            <span className="text-blue-400">Uppdatera sidan</span> för att se nya notifikationer.
          </p>
          <NotificationsManager />
        </div>
      </main>
    </div>
  );
} 