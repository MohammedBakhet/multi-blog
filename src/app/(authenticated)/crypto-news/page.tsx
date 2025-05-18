"use client";
import React, { useEffect, useState } from 'react';
import Header from '../Header';

const API_KEY = process.env.NEXT_PUBLIC_CRYPTOPANIC_API_KEY;

export default function CryptoNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cryptopanic-news')
      .then(res => res.json())
      .then(data => {
        setNews(data.results || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-8 pt-24 pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Crypto News</h1>
        {loading ? (
          <div className="text-center text-lg">Laddar nyheter...</div>
        ) : (
          <ul className="space-y-6">
            {news.map((item) => (
              <li key={item.id} className="bg-[#22242a] p-4 sm:p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="flex-1">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-semibold hover:underline text-base sm:text-lg block mb-1">
                    {item.title}
                  </a>
                  <div className="text-xs text-gray-400 mb-1">{new Date(item.published_at).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{item.domain}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
} 