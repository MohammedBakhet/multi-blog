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
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const filteredCryptos = cryptocurrencies;

  const clearFilter = () => {
    onCryptoSelect(null);
  };

  const handleCryptoSelect = (cryptoId: string) => {
    onCryptoSelect(cryptoId);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#1a1c23] to-[#22242a] border-r border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-[#1a1c23] to-[#22242a]">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Kryptovalutor
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2 font-medium">Sortera efter</label>
          <select
            className="w-full bg-[#16181c]/80 border border-gray-600/50 rounded-lg px-4 py-3 text-sm text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                     transition-all duration-300 cursor-pointer
                     backdrop-blur-sm"
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
            className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white px-4 py-3 rounded-lg
                     hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300
                     flex items-center justify-center gap-2 border border-gray-600/50
                     backdrop-blur-sm group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:rotate-90 transition-transform duration-300" 
                 viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" />
            </svg>
            Rensa Filter
          </button>
        )}
      </div>

      {/* Lista över kryptovalutor */}
      <div className="overflow-y-auto custom-scrollbar h-[calc(100vh-300px)]">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/30 border-t-blue-500"></div>
          </div>
        ) : filteredCryptos.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">Inga kryptovalutor hittades</div>
            <div className="text-gray-500 text-sm">Prova att söka efter något annat</div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700/50">
            {filteredCryptos.map(crypto => (
              <li 
                key={crypto.id} 
                className={`transition-all duration-300 ${
                  selectedCryptoId === crypto.id 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' 
                    : 'hover:bg-[#2a2d36]/50'
                }`}
                onClick={() => handleCryptoSelect(crypto.id)}
                onMouseEnter={() => setIsHovered(crypto.id)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <div className="px-6 py-4 cursor-pointer">
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={crypto.image} 
                        alt={crypto.name} 
                        className={`w-10 h-10 rounded-full transition-transform duration-300 ${
                          isHovered === crypto.id ? 'scale-110' : ''
                        }`}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                                    border-2 border-[#1a1c23] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">
                          {crypto.market_cap_rank}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center">
                        <span className="font-medium text-white">{crypto.name}</span>
                        <span className="text-gray-400 text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-700/50">
                          {crypto.symbol.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ${crypto.current_price?.toLocaleString()}
                      </div>
                    </div>
                    <div className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-300
                                  ${crypto.price_change_percentage_24h >= 0 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-red-500/10 text-red-400'}`}>
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CryptoFilter; 