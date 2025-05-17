import { NextRequest, NextResponse } from 'next/server';
import { generateChatbotResponse } from '../../../lib/openai';
import { getFilteredCryptocurrencies } from '../../../lib/cryptoService';
import { CryptoSortOption } from '../../../lib/cryptoTypes';

// Funktionen hämtar relevanta kryptoinformationer för att förbättra chatbot-svaren
async function getCryptoContext() {
  try {
    // Hämta trendande kryptovalutor
    const trendingCryptos = await getFilteredCryptocurrencies({
      sortBy: CryptoSortOption.TRENDING,
      limit: 3
    });
    
    // Hämta kryptovalutor med högst market cap
    const topMarketCapCryptos = await getFilteredCryptocurrencies({
      sortBy: CryptoSortOption.MARKET_CAP,
      limit: 3
    });
    
    // Formatera informationen som en sträng
    let context = 'Trending kryptovalutor: ';
    context += trendingCryptos.map(crypto => 
      `${crypto.name} (${crypto.symbol.toUpperCase()}) - $${crypto.current_price} (${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%)`
    ).join(', ');
    
    context += '\n\nKryptovalutor med högst market cap: ';
    context += topMarketCapCryptos.map(crypto => 
      `${crypto.name} (${crypto.symbol.toUpperCase()}) - $${crypto.current_price} (Market Cap: $${(crypto.market_cap / 1000000000).toFixed(2)}B)`
    ).join(', ');
    
    return context;
  } catch (error) {
    console.error('Fel vid hämtning av kryptokontext:', error);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Ogiltiga meddelandedata' },
        { status: 400 }
      );
    }
    
    // Hämta kryptokontext för mer informerade svar
    const cryptoContext = await getCryptoContext();
    
    // Generera ett svar från chatboten
    const response = await generateChatbotResponse(messages, cryptoContext);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Fel i chatbot API:', error);
    return NextResponse.json(
      { error: 'Ett fel inträffade vid bearbetning av förfrågan' },
      { status: 500 }
    );
  }
} 