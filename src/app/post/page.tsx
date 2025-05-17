'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Header from '../(authenticated)/Header';
import { Cryptocurrency, CryptoPostTag } from '../../lib/cryptoTypes';

interface Post {
  _id?: string;
  text: string;
  imageUrl?: string;
  userId?: string;
  likes?: string[];
  comments?: { userId: string; text: string; createdAt: string }[];
  createdAt?: string;
  profileImage?: string;
  cryptoTags?: CryptoPostTag[];
}

interface User {
  name: string;
  profileImage?: string;
  email?: string;
}

const PostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showOnlyUserPosts, setShowOnlyUserPosts] = useState(true);
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [detectedTags, setDetectedTags] = useState<CryptoPostTag[]>([]);

  // Lista på möjliga gamla namn (lägg till fler om du haft flera)
  const oldNames = ["demo-user"];

  useEffect(() => {
    fetchUser();
    fetchPosts();
    fetchCryptocurrencies();
  }, []);
  
  useEffect(() => {
    // Detect crypto tags in text as user types
    if (cryptocurrencies.length > 0) {
      detectCryptoTags(input);
    }
  }, [input, cryptocurrencies]);

  const fetchUser = async () => {
    const res = await fetch('/api/users/me');
    if (res.ok) {
      const data = await res.json();
      setUser({ name: data.name, profileImage: data.profileImage, email: data.email });
    }
  };

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
  };
  
  const fetchCryptocurrencies = async () => {
    try {
      const res = await fetch('/api/cryptocurrencies?limit=250');
      if (res.ok) {
        const data = await res.json();
        setCryptocurrencies(data);
      }
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
    }
  };
  
  const detectCryptoTags = (text: string) => {
    const tags: CryptoPostTag[] = [];
    const tagsSet = new Set<string>(); // To prevent duplicates
    
    // Create maps for efficient lookup
    const symbolMap = new Map<string, Cryptocurrency>();
    const nameMap = new Map<string, Cryptocurrency>();
    
    cryptocurrencies.forEach(crypto => {
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
    cryptocurrencies.forEach(crypto => {
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
    
    setDetectedTags(tags);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  // Ladda upp bilden till Cloudinary och returnera bildens URL
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_preset'); 
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await res.json();
    return data.secure_url || null;
  };

  const handlePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    let imageUrl = '';
    if (image) {
      imageUrl = (await uploadToCloudinary(image)) || '';
      console.log('Cloudinary imageUrl:', imageUrl);
    }
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input,
        imageUrl,
        userId: user.name,
        profileImage: user.profileImage,
      }),
    });
    setInput('');
    setImage(null);
    setImagePreview(null);
    setDetectedTags([]);
    setLoading(false);
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Vill du verkligen radera detta inlägg?')) return;
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    await fetchPosts();
  };

  // Hjälpfunktion för att kolla om inlägget är gillat av användaren
  const isLikedByUser = (post: Post): boolean => {
    if (!user || !post.likes) return false;
    return post.likes.includes(user.name);
  };

  // Funktion för att hantera gillningar
  const handleLike = async (postId: string) => {
    if (!user || !postId) return;
    
    try {
      // Optimistisk UI-uppdatering innan API-anropet för omedelbar feedback
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          const userHasLiked = isLikedByUser(post);
          const updatedLikes = userHasLiked
            ? post.likes?.filter(id => id !== user.name) || []
            : [...(post.likes || []), user.name];
          
          return {
            ...post,
            likes: updatedLikes
          };
        }
        return post;
      }));
      
      // Använder den befintliga API:n för att gilla/ogilla
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.name }),
      });
      
      if (response.ok) {
        // Hämta uppdaterad data från servern för att säkerställa synkronisering
        fetchPosts();
      }
    } catch (error) {
      console.error("Fel vid gillning av inlägg:", error);
      // Vid fel, återställ till ursprungligt tillstånd genom att hämta data från servern
      fetchPosts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="pt-20 px-4 max-w-3xl mx-auto">
        {/* Inläggsformulär */}
        <div className="bg-gray-800 rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-700 p-4">
            <h1 className="text-xl font-bold">New Post</h1>
          </div>
          
          <form onSubmit={handlePost} className="p-4">
            <div className="mb-4">
              <textarea
                className="w-full bg-gray-700 bg-opacity-50 rounded-lg p-4 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                placeholder="What's happening in the crypto world? Use $BTC or #ETH to tag cryptocurrencies"
                value={input}
                onChange={e => setInput(e.target.value)}
                maxLength={280}
                rows={4}
              />
              
              {/* Display detected crypto tags */}
              {detectedTags.length > 0 && (
                <div className="mt-2 p-3 bg-gray-700 bg-opacity-50 rounded-lg border border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-blue-400">Detected Cryptocurrency Tags:</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedTags.map((tag, idx) => {
                      // Find the crypto data to display price info
                      const cryptoData = cryptocurrencies.find(c => c.id === tag.cryptoId);
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-600"
                        >
                          {cryptoData?.image && (
                            <img src={cryptoData.image} alt={tag.name} className="w-5 h-5 mr-2 rounded-full" />
                          )}
                          <div>
                            <span className="text-blue-400 font-medium">${tag.symbol.toUpperCase()}</span>
                            <span className="text-gray-400 text-xs ml-1">({tag.name})</span>
                            {cryptoData && (
                              <span className={`ml-2 text-xs ${cryptoData.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {cryptoData.price_change_percentage_24h >= 0 ? '+' : ''}
                                {cryptoData.price_change_percentage_24h?.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Your post will be automatically tagged with these cryptocurrencies, making it easier for others to find.
                  </p>
                </div>
              )}
            </div>
            
            {imagePreview && (
              <div className="mb-4 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full object-contain bg-black rounded-lg border border-gray-600" 
                  style={{ maxHeight: '300px' }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <label className="cursor-pointer flex items-center hover:bg-gray-700 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                className={`${detectedTags.length > 0 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${!input.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!input.trim() || loading}
              >
                {detectedTags.length > 0 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                )}
                {loading ? 'Posting...' : detectedTags.length > 0 ? 'Post with Crypto Tags' : 'Post'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Senaste inlägg */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-700 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Senaste inlägg</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Visa bara mina inlägg</label>
              <input 
                type="checkbox" 
                checked={showOnlyUserPosts} 
                onChange={(e) => setShowOnlyUserPosts(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-500 rounded"
              />
            </div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {showOnlyUserPosts ? (
              // Visa bara användarens inlägg
              posts.filter(post => [user?.name, ...oldNames].includes(post.userId || "")).length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <p>Du har inte skapat några inlägg ännu</p>
                  <p className="text-sm mt-2">Skriv något i formuläret ovan för att skapa ett nytt inlägg</p>
                </div>
              ) : (
                posts
                  .filter(post => [user?.name, ...oldNames].includes(post.userId || ""))
                  .map((post) => (
                    <PostItem
                      key={post._id}
                      post={post}
                      isLikedByUser={isLikedByUser}
                      handleLike={handleLike}
                      handleDelete={handleDelete}
                    />
                  ))
              )
            ) : (
              // Visa alla inlägg
              posts.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <p>Inga inlägg ännu</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostItem
                    key={post._id}
                    post={post}
                    isLikedByUser={isLikedByUser}
                    handleLike={handleLike}
                    handleDelete={[user?.name, ...oldNames].includes(post.userId || "") ? handleDelete : undefined}
                  />
                ))
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

interface PostItemProps {
  post: Post;
  isLikedByUser: (post: Post) => boolean;
  handleLike: (postId: string) => Promise<void>;
  handleDelete?: (postId: string) => Promise<void>;
}

const PostItem = ({ post, isLikedByUser, handleLike, handleDelete }: PostItemProps) => {
  // Format post text to highlight crypto mentions
  const formatPostText = () => {
    if (!post.cryptoTags || post.cryptoTags.length === 0) return post.text;
    
    let formattedText = post.text;
    
    // Replace $SYMBOL mentions with styled spans
    post.cryptoTags.forEach(tag => {
      const regex = new RegExp(`\\$${tag.symbol}\\b`, 'gi');
      formattedText = formattedText.replace(regex, `<span class="text-blue-400 font-medium">$${tag.symbol.toUpperCase()}</span>`);
      
      // Also try to replace the crypto name (like "Bitcoin")
      const nameRegex = new RegExp(`\\b${tag.name}\\b`, 'gi');
      formattedText = formattedText.replace(nameRegex, `<span class="text-blue-400 font-medium">${tag.name}</span>`);
    });
    
    return formattedText;
  };
  
  return (
    <div className="p-4 hover:bg-gray-750">
      <div className="flex items-start space-x-3">
        {post.profileImage ? (
          <img 
            src={post.profileImage} 
            alt="Profilbild" 
            className="h-10 w-10 rounded-full object-cover flex-shrink-0" 
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            {post.userId?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-white">{post.userId}</span>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">
                {post.createdAt && new Date(post.createdAt).toLocaleString('sv-SE', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {handleDelete && (
                <button
                  onClick={() => handleDelete(post._id!)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Radera inlägg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div 
            dangerouslySetInnerHTML={{ __html: formatPostText() }} 
            className="text-white mb-3 whitespace-pre-wrap break-words"
          />
          
          {post.imageUrl && (
            <div className="mt-2 mb-3 rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="Inläggsbild" 
                className="w-full object-contain bg-black" 
                onClick={() => window.open(post.imageUrl, '_blank')}
                style={{ cursor: 'pointer', maxHeight: '400px' }}
              />
            </div>
          )}
          
          {/* Display crypto tags */}
          {post.cryptoTags && post.cryptoTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.cryptoTags.map((tag, index) => (
                <a 
                  key={index}
                  href={`/explore?crypto=${tag.cryptoId}`}
                  className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-600 transition-colors"
                >
                  <span className="text-blue-400">${tag.symbol.toUpperCase()}</span>
                </a>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-gray-400">
            <button 
              onClick={() => handleLike(post._id!)}
              className={`flex items-center space-x-1 ${isLikedByUser(post) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill={isLikedByUser(post) ? "currentColor" : "none"}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLikedByUser(post) ? "0" : "2"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes?.length || 0}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage; 