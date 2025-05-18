'use client'

import Header from '../Header';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function AuthenticatedHome() {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cryptocurrencies?limit=12')
      .then(res => res.json())
      .then(data => {
        setCryptos(data); 
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <header className="w-full max-w-3xl mx-auto text-center mt-24 mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-fadeIn">
            Välkommen till CryptoTalk
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 animate-fadeIn delay-100">
            Sveriges mest engagerande crypto-community! Utforska, diskutera och dela dina tankar om kryptovalutor, blockchain och marknadstrender. Filtrera, sortera och hitta likasinnade. 
          </p>
          <Link href="/explore" className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all animate-fadeIn delay-200">
            Utforska bloggen &rarr;
          </Link>
        </header>
        <section className="w-full max-w-5xl mx-auto bg-black/70 rounded-2xl p-8 shadow-2xl border border-blue-900/30 backdrop-blur-md animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 text-blue-300">Populära kryptovalutor</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {cryptos.map(coin => (
                <div key={coin.id} className="flex flex-col items-center bg-[#22242a] rounded-xl p-4 border border-blue-900/30 shadow hover:shadow-xl transition group">
                  <img src={coin.image} alt={coin.name} className="w-12 h-12 mb-2 rounded-full shadow" />
                  <span className="font-bold text-white text-lg mb-1">{coin.name}</span>
                  <span className="text-blue-400 text-xs mb-1">{coin.symbol.toUpperCase()}</span>
                  <span className="text-sm text-gray-300 mb-1">${coin.current_price.toLocaleString()}</span>
                  <span className={`text-xs font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
} 