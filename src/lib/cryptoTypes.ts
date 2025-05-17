export interface Cryptocurrency {
  id: string;          // Unique identifier
  symbol: string;      // BTC, ETH, etc.
  name: string;        // Bitcoin, Ethereum, etc.
  image: string;       // URL to logo
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;         // All-time high
  ath_date: string;
  mention_count?: number; // Number of mentions in posts (for MOST_DISCUSSED sort)
}

export interface CryptoPostTag {
  cryptoId: string;
  symbol: string;
  name: string;
}

export enum CryptoSortOption {
  MARKET_CAP = 'market_cap',
  PRICE = 'price',
  PRICE_CHANGE_24H = 'price_change_24h',
  TRENDING = 'trending',
  MOST_DISCUSSED = 'most_discussed',
}

export interface CryptoFilter {
  sortBy: CryptoSortOption;
  search?: string;
  tags?: string[];
  limit?: number;
}

export interface PostWithCryptoTags extends Post {
  cryptoTags?: CryptoPostTag[];
}

// Reusing Post interface from the existing codebase
export interface Post {
  _id: string;
  text: string;
  imageUrl?: string;
  userId?: string;
  createdAt?: string;
  likes?: string[];
  comments?: Comment[];
  profileImage?: string;
}

export interface Comment {
  userId: string;
  text: string;
  createdAt: string;
} 