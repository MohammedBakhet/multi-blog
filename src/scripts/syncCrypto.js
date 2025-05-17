// Script to sync cryptocurrency data with the database
// Run this with: node -r dotenv/config src/scripts/syncCrypto.js

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

async function syncCryptocurrencies() {
  console.log('Startar synkronisering av kryptovalutor...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Finns' : 'Saknas');
  console.log('URI börjar med:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'Ingen URI');
  
  if (!process.env.MONGODB_URI) {
    console.error('Fel: MONGODB_URI saknas i .env.local filen');
    console.error('Skapa en .env.local fil i projektets rot med följande innehåll:');
    console.error('MONGODB_URI=mongodb+srv://<användare>:<lösenord>@<cluster-url>/<databas>?retryWrites=true&w=majority');
    process.exit(1);
  }
  
  try {
    // Anslut till MongoDB
    console.log('Försöker ansluta till MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Ansluten till MongoDB');
    
    const db = client.db();
    const collection = db.collection('cryptocurrencies');
    
    // Hämta data från CoinGecko API (publik endpoint)
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Multi-Blog/1.0'
    };
    
    console.log('Hämtar data från CoinGecko API...');
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`API-anrop misslyckades: ${response.statusText}`);
    }
    
    const cryptos = await response.json();
    console.log(`Hämtade ${cryptos.length} kryptovalutor från API`);
    
    // Spara i databasen
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
    
    const result = await collection.bulkWrite(operations);
    console.log(`Uppdaterade ${result.modifiedCount} och lade till ${result.upsertedCount} kryptovalutor i databasen`);
    
    await client.close();
    console.log('Synkronisering slutförd!');
    
  } catch (error) {
    console.error('Fel vid synkronisering:', error);
    if (error.message.includes('startsWith')) {
      console.error('\nDetta fel uppstår vanligtvis när MongoDB-anslutningssträngen är felaktig.');
      console.error('Kontrollera att din MONGODB_URI i .env.local börjar med "mongodb://" eller "mongodb+srv://"');
    }
    process.exit(1);
  }
}

syncCryptocurrencies(); 