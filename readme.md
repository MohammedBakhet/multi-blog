# CryptoBlog - Social Media Platform for Crypto Enthusiasts

A specialized social media and blogging platform dedicated to cryptocurrency discussions, news, and insights.

## Features

### Core Features
- **User Authentication**: Secure login and account management
- **Post Creation**: Create posts with text and images
- **Social Interactions**: Like and comment on posts
- **Notifications**: Real-time notification system for interactions
- **AI Chatbot Assistant**: Get help, information and insights about cryptocurrencies with our AI-powered chatbot

### Crypto-Specific Features
- **Cryptocurrency Tags**: Automatically detect and tag cryptocurrency mentions in posts (using both symbol format like $BTC and name format like Bitcoin)
- **Crypto Filtering**: Filter posts by specific cryptocurrencies 
- **Market Data**: View current price and market cap for cryptocurrencies
- **Trending Cryptos**: See which cryptocurrencies are trending based on price movement
- **Most Discussed**: Discover cryptocurrencies with the most mentions in posts
- **Crypto Assistant**: AI-powered chatbot that can answer questions about cryptocurrencies with market context

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Cloudinary account (for image uploads)
- OpenAI API key (for the AI chatbot)

### Environment Setup
Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CRYPTO_SYNC_KEY=your_crypto_sync_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/crypto-blog.git
cd crypto-blog
```

2. Install dependencies
```bash
npm install
```

3. Initialize cryptocurrency data
```bash
node -r dotenv/config src/scripts/syncCrypto.js
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Image Storage**: Cloudinary
- **Crypto Data**: CoinGecko API (with local caching)
- **AI Assistant**: OpenAI API (GPT model)

## Data Flow

1. **Crypto Data Synchronization**:
   - Fetches cryptocurrency data from CoinGecko API
   - Stores in MongoDB for quick access and filtering
   - Can be run on a schedule (daily) for fresh data

2. **Post Creation with Crypto Tags**:
   - User creates post mentioning cryptocurrencies
   - System automatically detects crypto mentions
   - Tags are stored with the post for filtering

3. **Crypto-Based Exploration**:
   - Users can filter the explore feed by cryptocurrency
   - View market data alongside posts
   - Discover trending and popular cryptocurrencies

4. **AI Chatbot Assistant**:
   - Provides real-time assistance to users
   - Enhanced with current cryptocurrency market data
   - Answers questions about cryptocurrencies, blockchain technology, and trading

## Future Enhancements

- Price charts for cryptocurrencies
- Portfolio tracking features
- Crypto news integration
- Trading signals and analysis tools
- Enhanced crypto tag detection with sentiment analysis
- Market trends and prediction models
- Advanced AI features with personalized investment advice
