import clientPromise from './mongodb';
import { Cryptocurrency, CryptoFilter, CryptoSortOption, PostWithCryptoTags, CryptoPostTag } from './cryptoTypes';
import { WithId, Document } from 'mongodb';

// CoinGecko API base URL
const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.COINGECKO_API_KEY;

// Cache settings
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cryptoCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Fetch top cryptocurrencies from CoinGecko API with caching
 */
export async function fetchTopCryptocurrencies(limit: number = 100): Promise<Cryptocurrency[]> {
  const cacheKey = `top_${limit}`;
  const cached = cryptoCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Först försök hämta från databasen
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('cryptocurrencies');
    
    const dbCryptos = await collection
      .find({})
      .sort({ market_cap: -1 })
      .limit(limit)
      .toArray();
    
    if (dbCryptos.length > 0) {
      // Om vi har data i databasen, använd den
      const data = dbCryptos as unknown as Cryptocurrency[];
      cryptoCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return data;
    }

    // Om inga data i databasen, hämta från API
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'Multi-Blog/1.0'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }

    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cryptocurrencies: ${response.statusText}`);
    }
    
    const data: Cryptocurrency[] = await response.json();
    
    // Spara i databasen
    await storeCryptocurrencies(data);
    
    // Uppdatera cache
    cryptoCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    // Returnera cachad data om tillgänglig, även om den har gått ut
    if (cached) {
      return cached.data;
    }
    return [];
  }
}

/**
 * Store or update cryptocurrencies in MongoDB with error handling
 */
export async function storeCryptocurrencies(cryptos: Cryptocurrency[]): Promise<void> {
  if (!cryptos.length) return;
  
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('cryptocurrencies');
    
    // Use bulk operations for efficiency
    const operations = cryptos.map(crypto => ({
      updateOne: {
        filter: { id: crypto.id },
        update: { 
          $set: { 
            ...crypto,
            last_updated: new Date(),
            price_history: {
              current: crypto.current_price,
              change_24h: crypto.price_change_percentage_24h,
              timestamp: new Date()
            }
          }
        },
        upsert: true
      }
    }));
    
    await collection.bulkWrite(operations);
    
    // Update cache after successful database update
    const cacheKey = `top_${cryptos.length}`;
    cryptoCache.set(cacheKey, {
      data: cryptos,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error storing cryptocurrencies:', error);
    throw error; // Propagate error for handling by caller
  }
}

/**
 * Get filtered and sorted cryptocurrencies from MongoDB with improved querying
 */
export async function getFilteredCryptocurrencies(filter: CryptoFilter): Promise<Cryptocurrency[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('cryptocurrencies');
    
    // Build query based on filter
    const query: any = {};
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { symbol: { $regex: filter.search, $options: 'i' } }
      ];
    }
    
    if (filter.tags && filter.tags.length > 0) {
      query.id = { $in: filter.tags };
    }
    
    // Determine sort options
    let sortOption: any = {};
    switch (filter.sortBy) {
      case CryptoSortOption.MARKET_CAP:
        sortOption = { market_cap: -1 };
        break;
      case CryptoSortOption.PRICE:
        sortOption = { current_price: -1 };
        break;
      case CryptoSortOption.PRICE_CHANGE_24H:
        sortOption = { price_change_percentage_24h: -1 };
        break;
      case CryptoSortOption.TRENDING:
        // Use a combination of price change and market cap for trending
        sortOption = {
          price_change_percentage_24h: -1,
          market_cap: -1
        };
        break;
      case CryptoSortOption.MOST_DISCUSSED:
        sortOption = { mention_count: -1, market_cap: -1 };
        break;
      default:
        sortOption = { market_cap: -1 };
    }
    
    // Execute query with projection for better performance
    const cryptos = await collection
      .find(query)
      .sort(sortOption)
      .limit(filter.limit || 100)
      .project({
        id: 1,
        symbol: 1,
        name: 1,
        image: 1,
        current_price: 1,
        market_cap: 1,
        market_cap_rank: 1,
        price_change_percentage_24h: 1,
        circulating_supply: 1,
        total_supply: 1,
        ath: 1,
        ath_date: 1,
        mention_count: 1
      })
      .toArray();
    
    return cryptos as unknown as Cryptocurrency[];
  } catch (error) {
    console.error('Error getting filtered cryptocurrencies:', error);
    return [];
  }
}

/**
 * Get trending cryptocurrencies with improved algorithm
 */
export async function getTrendingCryptocurrencies(limit: number = 10): Promise<Cryptocurrency[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const trending = await db.collection('cryptocurrencies')
      .find({})
      .sort({
        price_change_percentage_24h: -1,
        market_cap: -1
      })
      .limit(limit)
      .toArray();
    
    return trending as unknown as Cryptocurrency[];
  } catch (error) {
    console.error('Error getting trending cryptocurrencies:', error);
    return [];
  }
}

/**
 * Count cryptocurrency mentions in posts with improved aggregation
 */
export async function getMostDiscussedCryptocurrencies(limit: number = 10): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection('posts')
      .aggregate([
        { $match: { cryptoTags: { $exists: true, $ne: [] } } },
        { $unwind: "$cryptoTags" },
        { $group: { 
            _id: "$cryptoTags.cryptoId", 
            count: { $sum: 1 },
            symbol: { $first: "$cryptoTags.symbol" },
            name: { $first: "$cryptoTags.name" },
            lastMentioned: { $max: "$createdAt" }
          } 
        },
        { $sort: { count: -1, lastMentioned: -1 } },
        { $limit: limit }
      ])
      .toArray();
    
    const cryptoIds = result.map(item => item._id);
    const cryptos = await db.collection('cryptocurrencies')
      .find({ id: { $in: cryptoIds } })
      .toArray();
    
    const cryptoMap = new Map(cryptos.map(crypto => [crypto.id, crypto]));
    const mostDiscussed = result.map(item => ({
      ...cryptoMap.get(item._id),
      mention_count: item.count,
      last_mentioned: item.lastMentioned
    }));
    
    return mostDiscussed;
  } catch (error) {
    console.error('Error getting most discussed cryptocurrencies:', error);
    return [];
  }
}

/**
 * Extract cryptocurrency tags from post text with improved matching
 */
export function extractCryptoTags(text: string, cryptos: WithId<Document>[]): CryptoPostTag[] {
  const tags: CryptoPostTag[] = [];
  const tagsSet = new Set<string>();
  
  const symbolMap = new Map<string, any>();
  const nameMap = new Map<string, any>();
  
  cryptos.forEach(crypto => {
    if (crypto.symbol && crypto.id && crypto.name) {
      symbolMap.set(crypto.symbol.toLowerCase(), crypto);
      nameMap.set(crypto.name.toLowerCase(), crypto);
    }
  });
  
  // Match symbols with $ or # prefix
  const symbolRegex = /[\$\#]([a-zA-Z]{2,10})\b/g;
  let match;
  while ((match = symbolRegex.exec(text)) !== null) {
    const symbol = match[1].toLowerCase();
    const crypto = symbolMap.get(symbol);
    if (crypto && !tagsSet.has(crypto.id)) {
      tags.push({
        cryptoId: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name
      });
      tagsSet.add(crypto.id);
    }
  }
  
  // Match full names
  const words = text.toLowerCase().split(/\s+/);
  words.forEach(word => {
    const crypto = nameMap.get(word);
    if (crypto && !tagsSet.has(crypto.id)) {
      tags.push({
        cryptoId: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name
      });
      tagsSet.add(crypto.id);
    }
  });
  
  return tags;
}

/**
 * Sync crypto data from CoinGecko API to MongoDB with improved error handling
 */
export async function syncCryptocurrencies(): Promise<void> {
  try {
    console.log('Starting cryptocurrency sync...');
    const cryptos = await fetchTopCryptocurrencies(250);
    
    if (cryptos.length === 0) {
      throw new Error('No cryptocurrencies fetched from API');
    }
    
    await storeCryptocurrencies(cryptos);
    console.log(`Successfully synced ${cryptos.length} cryptocurrencies`);
  } catch (error) {
    console.error('Error syncing cryptocurrencies:', error);
    throw error;
  }
} 