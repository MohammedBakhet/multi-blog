'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cryptocurrency, CryptoSortOption } from '../../../../lib/cryptoTypes';

interface CryptoFilterProps {
  onCryptoSelect: (cryptoId: string | null) => void;
  onSortChange: (option: CryptoSortOption) => void;
  selectedCryptoId: string | null;
  cryptocurrencies: Cryptocurrency[];
  sortOption: CryptoSortOption;
  loading: boolean;
}

const CryptoFilter: React.FC<CryptoFilterProps> = ({
  onCryptoSelect,
  onSortChange,
  selectedCryptoId,
  cryptocurrencies,
  sortOption,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCryptos = searchTerm
    ? cryptocurrencies.filter(crypto => 
        crypto.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        crypto.symbol?.toLowerCase().includes(searchTerm.toLowerCase()))
    : cryptocurrencies;

  const clearFilter = () => {
    onCryptoSelect(null);
    setSearchTerm('');
  };

  const handleCryptoSelect = (cryptoId: string) => {
    onCryptoSelect(cryptoId);
  };

  return (
    <div className="w-full h-full bg-[#22242a] border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold mb-4">Filtrera Cryptos</h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Sök kryptovaluta..."
            className="w-full bg-[#16181c] border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Sortera efter</label>
          <select
            className="w-full bg-[#16181c] border border-gray-600 rounded px-3 py-2 text-sm text-white"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as CryptoSortOption)}
          >
            <option value={CryptoSortOption.MARKET_CAP}>Market Cap</option>
            <option value={CryptoSortOption.PRICE}>Pris</option>
            <option value={CryptoSortOption.PRICE_CHANGE_24H}>Prisändring (24h)</option>
            <option value={CryptoSortOption.TRENDING}>Trendande</option>
            <option value={CryptoSortOption.MOST_DISCUSSED}>Mest Diskuterade</option>
          </select>
        </div>
        
        {selectedCryptoId && (
          <button
            onClick={clearFilter}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Rensa Filter
          </button>
        )}
      </div>

      {/* Lista över kryptovalutor */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCryptos.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            Inga kryptovalutor hittades
          </div>
        ) : (
          <ul>
            {filteredCryptos.map(crypto => (
              <li 
                key={crypto.id} 
                className={`border-b border-gray-700 last:border-b-0 ${selectedCryptoId === crypto.id ? 'bg-[#2a2d36]' : ''}`}
                onClick={() => handleCryptoSelect(crypto.id)}
              >
                <div className="px-4 py-3 hover:bg-[#2a2d36] cursor-pointer transition">
                  <div className="flex items-center">
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 mr-3 rounded-full" />
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-gray-400 text-xs ml-2">{crypto.symbol.toUpperCase()}</span>
                      </div>
                      <div className="text-xs text-gray-400">#{crypto.market_cap_rank} Rank</div>
                    </div>
                    <div className={`text-xs font-medium ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CryptoFilter; 