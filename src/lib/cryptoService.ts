import clientPromise from './mongodb';
import { Cryptocurrency, CryptoFilter, CryptoSortOption, PostWithCryptoTags, CryptoPostTag } from './cryptoTypes';
import { WithId, Document } from 'mongodb';

// CoinGecko API base URL
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetch top cryptocurrencies from CoinGecko API
 */
export async function fetchTopCryptocurrencies(limit: number = 100): Promise<Cryptocurrency[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch cryptocurrencies');
    }
    
    const data: Cryptocurrency[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return [];
  }
}

/**
 * Store or update cryptocurrencies in MongoDB
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
        update: { $set: { ...crypto, last_updated: new Date() } },
        upsert: true
      }
    }));
    
    await collection.bulkWrite(operations);
  } catch (error) {
    console.error('Error storing cryptocurrencies:', error);
  }
}

/**
 * Get filtered and sorted cryptocurrencies from MongoDB
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
      // Special cases handled below
      default:
        sortOption = { market_cap: -1 };
    }
    
    // For trending and most discussed, we need special handling
    if (filter.sortBy === CryptoSortOption.TRENDING || filter.sortBy === CryptoSortOption.MOST_DISCUSSED) {
      // These would require additional data sources/calculations
      // For trending, we might query a separate trending table or API
      // For most discussed, we need to count mentions in posts
      
      // For now, if trending or most discussed, we'll use a placeholder implementation
      if (filter.sortBy === CryptoSortOption.TRENDING) {
        // Placeholder: use price change as a proxy for trending
        sortOption = { price_change_percentage_24h: -1 };
      } else if (filter.sortBy === CryptoSortOption.MOST_DISCUSSED) {
        // This would ideally be implemented with an aggregation pipeline
        // For now, default to market cap
        sortOption = { market_cap: -1 };
      }
    }
    
    // Execute query
    const cryptos = await collection
      .find(query)
      .sort(sortOption)
      .limit(filter.limit || 100)
      .toArray();
    
    return cryptos as unknown as Cryptocurrency[];
  } catch (error) {
    console.error('Error getting filtered cryptocurrencies:', error);
    return [];
  }
}

/**
 * Get trending cryptocurrencies based on price change
 */
export async function getTrendingCryptocurrencies(limit: number = 10): Promise<Cryptocurrency[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const trending = await db.collection('cryptocurrencies')
      .find({})
      .sort({ price_change_percentage_24h: -1 })
      .limit(limit)
      .toArray();
    
    return trending as unknown as Cryptocurrency[];
  } catch (error) {
    console.error('Error getting trending cryptocurrencies:', error);
    return [];
  }
}

/**
 * Count cryptocurrency mentions in posts
 */
export async function getMostDiscussedCryptocurrencies(limit: number = 10): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Look for posts with crypto tags and count occurrences
    const result = await db.collection('posts')
      .aggregate([
        { $match: { cryptoTags: { $exists: true, $ne: [] } } },
        { $unwind: "$cryptoTags" },
        { $group: { 
            _id: "$cryptoTags.cryptoId", 
            count: { $sum: 1 },
            symbol: { $first: "$cryptoTags.symbol" },
            name: { $first: "$cryptoTags.name" }
          } 
        },
        { $sort: { count: -1 } },
        { $limit: limit }
      ])
      .toArray();
    
    // Join with cryptocurrency data
    const cryptoIds = result.map(item => item._id);
    const cryptos = await db.collection('cryptocurrencies')
      .find({ id: { $in: cryptoIds } })
      .toArray();
    
    // Merge count data with crypto details
    const cryptoMap = new Map(cryptos.map(crypto => [crypto.id, crypto]));
    const mostDiscussed = result.map(item => ({
      ...cryptoMap.get(item._id),
      mention_count: item.count
    }));
    
    return mostDiscussed;
  } catch (error) {
    console.error('Error getting most discussed cryptocurrencies:', error);
    return [];
  }
}

/**
 * Extract cryptocurrency tags from post text
 */
export function extractCryptoTags(text: string, cryptos: WithId<Document>[]): CryptoPostTag[] {
  const tags: CryptoPostTag[] = [];
  const tagsSet = new Set<string>(); // To prevent duplicates
  
  // Create a map for efficient lookup
  const symbolMap = new Map<string, any>();
  const nameMap = new Map<string, any>();
  
  cryptos.forEach(crypto => {
    if (crypto.symbol && crypto.id && crypto.name) {
      symbolMap.set(crypto.symbol.toLowerCase(), crypto);
      nameMap.set(crypto.name.toLowerCase(), crypto);
    }
  });
  
  // Check for symbol mentions (like $BTC or #ETH)
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
  
  // Check for name mentions (like Bitcoin or Ethereum)
  cryptos.forEach(crypto => {
    if (crypto.name && crypto.id) {
      const cryptoName = crypto.name.toLowerCase();
      if (text.toLowerCase().includes(cryptoName) && !tagsSet.has(crypto.id)) {
        tags.push({
          cryptoId: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name
        });
        tagsSet.add(crypto.id);
      }
    }
  });
  
  return tags;
}

/**
 * Function to sync crypto data from CoinGecko API to MongoDB
 * This could be run on a scheduled basis (e.g., daily)
 */
export async function syncCryptocurrencies(): Promise<void> {
  try {
    console.log('Starting cryptocurrency sync...');
    const cryptos = await fetchTopCryptocurrencies(250);
    if (cryptos.length > 0) {
      await storeCryptocurrencies(cryptos);
      console.log(`Successfully synced ${cryptos.length} cryptocurrencies`);
    } else {
      console.log('No cryptocurrencies fetched');
    }
  } catch (error) {
    console.error('Error syncing cryptocurrencies:', error);
  }
} 