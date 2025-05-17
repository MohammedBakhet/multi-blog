import { NextRequest, NextResponse } from 'next/server';
import { 
  getFilteredCryptocurrencies, 
  getTrendingCryptocurrencies, 
  getMostDiscussedCryptocurrencies,
  syncCryptocurrencies
} from '../../../lib/cryptoService';
import { CryptoFilter, CryptoSortOption } from '../../../lib/cryptoTypes';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sortBy = searchParams.get('sortBy') as CryptoSortOption || CryptoSortOption.MARKET_CAP;
  const search = searchParams.get('search') || undefined;
  const tags = searchParams.get('tags')?.split(',') || undefined;
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  
  try {
    // Skapa filter-objekt
    const filter: CryptoFilter = {
      sortBy,
      search,
      tags,
      limit
    };

    // Hämta data baserat på sorteringsmetod
    let data;
    switch (sortBy) {
      case CryptoSortOption.TRENDING:
        data = await getTrendingCryptocurrencies(limit);
        break;
      case CryptoSortOption.MOST_DISCUSSED:
        data = await getMostDiscussedCryptocurrencies(limit);
        break;
      default:
        data = await getFilteredCryptocurrencies(filter);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fel vid hämtning av kryptovalutor:", error);
    return NextResponse.json({ error: "Kunde inte hämta kryptovalutor" }, { status: 500 });
  }
}

// Endpoint för att manuellt trigga synkronisering av kryptovalutor
export async function POST(req: NextRequest) {
  try {
    await syncCryptocurrencies();
    return NextResponse.json({ 
      success: true, 
      message: 'Kryptovalutor synkroniserade framgångsrikt'
    });
  } catch (error) {
    console.error("Fel vid synkronisering av kryptovalutor:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Kunde inte synkronisera kryptovalutor" 
    }, { status: 500 });
  }
} 