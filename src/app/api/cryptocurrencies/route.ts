import { NextRequest, NextResponse } from 'next/server';
import { 
  getFilteredCryptocurrencies, 
  getTrendingCryptocurrencies, 
  getMostDiscussedCryptocurrencies,
  syncCryptocurrencies
} from '../../../lib/cryptoService';
import { CryptoFilter, CryptoSortOption, Cryptocurrency } from '../../../lib/cryptoTypes';

// Dummy data för att testa utan databas
const DUMMY_CRYPTOCURRENCIES: Cryptocurrency[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 64387,
    market_cap: 1267891827382,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    circulating_supply: 19728950,
    total_supply: 21000000,
    ath: 69045,
    ath_date: '2021-11-10T14:24:11.849Z'
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3462,
    market_cap: 416827639345,
    market_cap_rank: 2,
    price_change_percentage_24h: 1.8,
    circulating_supply: 120267291,
    total_supply: 120267291,
    ath: 4878.26,
    ath_date: '2021-11-10T14:24:19.604Z'
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 608.42,
    market_cap: 93352740908,
    market_cap_rank: 3,
    price_change_percentage_24h: 3.7,
    circulating_supply: 153856150,
    total_supply: 153856150,
    ath: 686.31,
    ath_date: '2021-05-10T07:24:17.097Z'
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 156.42,
    market_cap: 68419753908,
    market_cap_rank: 4,
    price_change_percentage_24h: -2.3,
    circulating_supply: 437356149,
    total_supply: 539312448,
    ath: 259.96,
    ath_date: '2021-11-06T21:54:35.825Z'
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    current_price: 0.51,
    market_cap: 27832740908,
    market_cap_rank: 5,
    price_change_percentage_24h: 0.9,
    circulating_supply: 54542476307,
    total_supply: 100000000000,
    ath: 3.40,
    ath_date: '2018-01-07T00:00:00.000Z'
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    current_price: 0.45,
    market_cap: 15912740908,
    market_cap_rank: 6,
    price_change_percentage_24h: 1.1,
    circulating_supply: 35341852492,
    total_supply: 45000000000,
    ath: 3.09,
    ath_date: '2021-09-02T06:00:10.474Z'
  },
  {
    id: 'avalanche',
    symbol: 'avax',
    name: 'Avalanche',
    image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    current_price: 34.12,
    market_cap: 12732740908,
    market_cap_rank: 7,
    price_change_percentage_24h: 5.6,
    circulating_supply: 372761921,
    total_supply: 720000000,
    ath: 144.96,
    ath_date: '2021-11-21T14:18:56.538Z'
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    current_price: 0.125,
    market_cap: 17732740908,
    market_cap_rank: 8,
    price_change_percentage_24h: -1.2,
    circulating_supply: 141765116384,
    total_supply: 141765116384,
    ath: 0.731578,
    ath_date: '2021-05-08T05:08:23.458Z'
  },
  {
    id: 'polkadot',
    symbol: 'dot',
    name: 'Polkadot',
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    current_price: 6.95,
    market_cap: 9732740908,
    market_cap_rank: 9,
    price_change_percentage_24h: 3.2,
    circulating_supply: 1400744767,
    total_supply: 1290277056,
    ath: 54.98,
    ath_date: '2021-11-04T15:10:09.301Z'
  },
  {
    id: 'shiba-inu',
    symbol: 'shib',
    name: 'Shiba Inu',
    image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    current_price: 0.0000225,
    market_cap: 13232740908,
    market_cap_rank: 10,
    price_change_percentage_24h: 8.7,
    circulating_supply: 589354373008713,
    total_supply: 999991781076831,
    ath: 0.00008616,
    ath_date: '2021-10-28T03:54:55.568Z'
  }
];

// Dummy data för mest diskuterade cryptos
const MOST_DISCUSSED_CRYPTOCURRENCIES = DUMMY_CRYPTOCURRENCIES.map((crypto, index) => ({
  ...crypto,
  mention_count: 100 - (index * 10)
}));

// Dummy data för trendande cryptos (sorterade efter prisförändring)
const TRENDING_CRYPTOCURRENCIES = [...DUMMY_CRYPTOCURRENCIES].sort(
  (a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)
);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sortBy = searchParams.get('sortBy') as CryptoSortOption || CryptoSortOption.MARKET_CAP;
  const search = searchParams.get('search') || undefined;
  const tags = searchParams.get('tags')?.split(',') || undefined;
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  
  // Använd dummy data istället för databas
  try {
    // Special case handlers for trending and most discussed
    if (sortBy === CryptoSortOption.TRENDING) {
      // För trendande, använd dummy data sorterad efter prisförändring
      return NextResponse.json(TRENDING_CRYPTOCURRENCIES.slice(0, limit));
    }
    
    if (sortBy === CryptoSortOption.MOST_DISCUSSED) {
      // För mest diskuterade, använd dummy data med mention_count
      return NextResponse.json(MOST_DISCUSSED_CRYPTOCURRENCIES.slice(0, limit));
    }
    
    // Default case - filtered cryptos från dummy data
    let filteredCryptos = [...DUMMY_CRYPTOCURRENCIES];
    
    // Applicera sökfilter om det finns
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCryptos = filteredCryptos.filter(
        crypto => crypto.name.toLowerCase().includes(searchLower) || 
                 crypto.symbol.toLowerCase().includes(searchLower)
      );
    }
    
    // Applicera tag-filter om det finns
    if (tags && tags.length > 0) {
      filteredCryptos = filteredCryptos.filter(crypto => tags.includes(crypto.id));
    }
    
    // Sortera efter vald sorteringsmetod
    switch (sortBy) {
      case CryptoSortOption.MARKET_CAP:
        filteredCryptos.sort((a, b) => b.market_cap - a.market_cap);
        break;
      case CryptoSortOption.PRICE:
        filteredCryptos.sort((a, b) => b.current_price - a.current_price);
        break;
      case CryptoSortOption.PRICE_CHANGE_24H:
        filteredCryptos.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        break;
    }
    
    return NextResponse.json(filteredCryptos.slice(0, limit));
  } catch (error) {
    console.error("Fel vid hämtning av kryptovalutor:", error);
    return NextResponse.json({ error: "Kunde inte hämta kryptovalutor" }, { status: 500 });
  }
}

// Endpoint to manually trigger cryptocurrency sync - (disabled in dummy version)
export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Dummy-data används, ingen synkronisering behövs',
    note: 'För att använda riktigt API, konfigurera MongoDB-anslutning i .env-filen'
  });
} 