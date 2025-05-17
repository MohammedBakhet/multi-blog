'use client';

import React from 'react';
import NotificationsManager from '../../components/NotificationsManager';
import Header from '../Header';

export default function NotificationsPage() {
  return (
    <>
      <Header />
      <div className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Dina notifikationer</h1>
        <p className="text-gray-300 mb-6">
          Här kan du se och hantera alla dina notifikationer. Uppdatera sidan manuellt för att se nya notifikationer.
        </p>
        <NotificationsManager />
      </div>
    </>
  );
} 