// Script to sync cryptocurrency data with the database
// Run this with: node -r dotenv/config src/scripts/syncCrypto.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// CoinGecko API base URL
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetch top cryptocurrencies from CoinGecko API
 */
async function fetchTopCryptocurrencies(limit = 250) {
  try {
    console.log(`Fetching top ${limit} cryptocurrencies from CoinGecko...`);
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cryptocurrencies: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} cryptocurrencies`);
    return data;
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return [];
  }
}

/**
 * Store cryptocurrencies in MongoDB
 */
async function storeCryptocurrencies(cryptos) {
  if (!cryptos.length) {
    console.log('No cryptocurrencies to store');
    return;
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
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
    
    console.log(`Inserting/updating ${operations.length} cryptocurrencies...`);
    const result = await collection.bulkWrite(operations);
    
    console.log(`Successfully processed cryptocurrencies:`);
    console.log(`- Inserted: ${result.upsertedCount}`);
    console.log(`- Modified: ${result.modifiedCount}`);
    console.log(`- Matched: ${result.matchedCount}`);
    
  } catch (error) {
    console.error('Error storing cryptocurrencies:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

/**
 * Main function to run the sync
 */
async function main() {
  console.log('Starting cryptocurrency sync...');
  
  const cryptos = await fetchTopCryptocurrencies(250);
  
  if (cryptos.length > 0) {
    await storeCryptocurrencies(cryptos);
    console.log(`Successfully synced ${cryptos.length} cryptocurrencies`);
  } else {
    console.log('No cryptocurrencies fetched, sync aborted');
  }
}

// Run the main function
main()
  .then(() => {
    console.log('Cryptocurrency sync completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error during cryptocurrency sync:', err);
    process.exit(1);
  }); 