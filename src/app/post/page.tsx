'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Header from '../(authenticated)/Header';
import { Cryptocurrency, CryptoPostTag } from '../../lib/cryptoTypes';

interface Post {
  _id: string;
  text: string;
  imageUrl?: string;
  userId?: string;
  createdAt?: string;
  likes?: string[];
  comments?: Comment[];
  profileImage?: string;
  cryptoTags?: CryptoPostTag[];
}

interface Comment {
  userId: string;
  text: string;
  createdAt: string;
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
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      // Säkerställ att vi hanterar API-svaret korrekt
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
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
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col relative overflow-hidden">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start pt-24 relative z-10">
        <div className="w-full max-w-3xl p-8 border border-blue-900/30 rounded-2xl shadow-2xl bg-black/80 animate-fadeIn backdrop-blur-md mb-8">
          <h1 className="text-3xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Mina crypto-inlägg
          </h1>
          <p className="text-gray-300 mb-6 text-center">
            Dela dina tankar om kryptovalutor, marknadstrender och blockchain. Tagga coins med <span className="text-blue-400">$BTC</span>, <span className="text-blue-400">#ETH</span> eller skriv coin-namnet för att länka till en valuta!
          </p>
          {/* Skapa nytt inlägg */}
          <form onSubmit={handlePost} className="flex flex-col gap-4 mb-8">
            <textarea
              className="w-full rounded-lg bg-[#22242a] border border-blue-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Vad vill du diskutera? T.ex. $BTC till månen!"
              rows={3}
              maxLength={280}
              required
            />
            {imagePreview && (
              <div className="mb-2 flex items-center gap-4">
                <img src={imagePreview} alt="Förhandsvisning" className="w-24 h-24 object-cover rounded-lg border border-blue-700" />
                <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} className="text-red-400 hover:underline">Ta bort bild</button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="cursor-pointer text-blue-400 hover:underline">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                Lägg till bild
              </label>
              <div className="flex gap-2 flex-wrap">
                {detectedTags.map(tag => (
                  <span key={tag.cryptoId} className="px-2 py-1 rounded bg-blue-700/30 text-blue-300 text-xs font-semibold">{tag.symbol.toUpperCase()} ({tag.name})</span>
                ))}
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="ml-auto px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Postar...' : 'Posta'}
              </button>
            </div>
          </form>
        </div>
        {/* Feed */}
        <div className="w-full max-w-3xl p-8 border border-blue-900/30 rounded-2xl shadow-2xl bg-black/80 animate-fadeIn backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-300">Dina senaste crypto-inlägg</h2>
          {user && posts.filter(post => post.userId === user.name).length === 0 ? (
            <div className="text-gray-400 text-center py-10">Du har inte postat något ännu. Bli först med att posta!</div>
          ) : (
            <ul className="space-y-8">
              {user && posts
                .filter(post => post.userId === user.name)
                .map(post => (
                  <li key={post._id} className="bg-[#181a20] border border-blue-900/30 rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      {post.profileImage ? (
                        <img src={post.profileImage} alt="Profilbild" className="h-10 w-10 rounded-full object-cover bg-gray-700 border border-blue-700" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg">
                          <span>👤</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{post.userId || 'Anonym'}</span>
                        </div>
                        <span className="text-xs text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</span>
                      </div>
                    </div>
                    <div className="mb-3 text-white text-base">
                      {post.text}
                    </div>
                    {post.imageUrl && (
                      <div className="mb-3">
                        <img src={post.imageUrl} alt="Inläggsbild" className="w-full max-h-80 object-contain rounded-xl border border-blue-900/30 bg-black" />
                      </div>
                    )}
                    {post.cryptoTags && post.cryptoTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.cryptoTags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 rounded bg-blue-700/30 text-blue-300 text-xs font-semibold">{tag.symbol.toUpperCase()} ({tag.name})</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-gray-400 text-sm mb-2">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1 ${isLikedByUser(post) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'} transition`}
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
                        {post.likes?.length || 0} Likes
                      </button>
                      <span>{post.comments?.length || 0} Kommentarer</span>
                      <button onClick={() => handleDelete(post._id)} className="text-red-400 hover:underline ml-auto">Radera</button>
                    </div>
                    {/* Kommentarer */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {post.comments.map((comment, idx) => (
                          <div key={idx} className="bg-[#22242a] rounded p-2 text-sm text-gray-200">
                            <span className="font-semibold">{comment.userId}</span>{' '}
                            <span className="text-xs text-gray-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</span>
                            <div>{comment.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          )}
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
                  onClick={() => handleDelete(post._id)}
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
              onClick={() => handleLike(post._id)}
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