"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../Header';
import { Cryptocurrency, CryptoSortOption, CryptoPostTag } from '../../../lib/cryptoTypes';
import CryptoFilter from './components/CryptoFilter';

interface Comment {
  userId: string;
  text: string;
  createdAt: string;
}

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

interface User {
  name: string;
  profileImage?: string;
  email?: string;
}

const MAX_COMMENT_LENGTH = 180;
const SHORT_COMMENT_LENGTH = 60;

function timeAgo(dateString?: string) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// Function to format post text with highlighted crypto mentions
const formatPostTextWithCryptoMentions = (text: string, cryptoTags?: CryptoPostTag[]) => {
  if (!cryptoTags || cryptoTags.length === 0) return text;
  
  // Create a map to replace symbols with styled versions
  let formattedText = text;
  
  // Replace $SYMBOL mentions with styled versions
  cryptoTags.forEach(tag => {
    const regex = new RegExp(`\\$${tag.symbol}\\b`, 'gi');
    formattedText = formattedText.replace(regex, `<span class="text-blue-400 font-medium cursor-pointer hover:underline">$${tag.symbol.toUpperCase()}</span>`);
    
    // Also try to replace the crypto name (like "Bitcoin")
    const nameRegex = new RegExp(`\\b${tag.name}\\b`, 'gi');
    formattedText = formattedText.replace(nameRegex, `<span class="text-blue-400 font-medium cursor-pointer hover:underline">${tag.name}</span>`);
  });
  
  return formattedText;
};

const ExplorePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [likeLoading, setLikeLoading] = useState<{ [key: string]: boolean }>({});
  const [commentLoading, setCommentLoading] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<User | null>(null);
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [selectedCryptoFilter, setSelectedCryptoFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<CryptoSortOption>(CryptoSortOption.MARKET_CAP);
  
  useEffect(() => {
    fetchUser();
    fetchPosts();
    fetchCryptocurrencies();
  }, []);
  
  useEffect(() => {
    // Re-fetch posts when crypto filter changes
    if (selectedCryptoFilter) {
      fetchPostsByTag(selectedCryptoFilter);
    } else {
      fetchPosts();
    }
  }, [selectedCryptoFilter]);

  const fetchUser = async () => {
    const res = await fetch('/api/users/me');
    if (res.ok) {
      const data = await res.json();
      setUser({ name: data.name, profileImage: data.profileImage, email: data.email });
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };
  
  const fetchPostsByTag = async (cryptoId: string) => {
    setLoading(true);
    const res = await fetch(`/api/posts?cryptoTag=${cryptoId}`);
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };
  
  const fetchCryptocurrencies = async () => {
    setCryptoLoading(true);
    try {
      const res = await fetch(`/api/cryptocurrencies?sortBy=${sortOption}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setCryptocurrencies(data);
      }
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
    } finally {
      setCryptoLoading(false);
    }
  };
  
  const handleSortChange = async (option: CryptoSortOption) => {
    setSortOption(option);
    setCryptoLoading(true);
    try {
      const res = await fetch(`/api/cryptocurrencies?sortBy=${option}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setCryptocurrencies(data);
      }
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
    } finally {
      setCryptoLoading(false);
    }
  };

  const isLikedByUser = (post: Post): boolean => {
    if (!user || !post.likes) return false;
    return post.likes.includes(user.name);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    setLikeLoading(l => ({ ...l, [postId]: true }));
    
    // Optimistisk UI-uppdatering
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
    
    await fetch(`/api/posts/${postId}/like`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.name }),
    });
    
    if (selectedCryptoFilter) {
      await fetchPostsByTag(selectedCryptoFilter);
    } else {
      await fetchPosts();
    }
    
    setLikeLoading(l => ({ ...l, [postId]: false }));
  };

  const handleComment = async (postId: string) => {
    if (!user) return;
    const text = commentInputs[postId]?.trim();
    if (!text || text.length === 0 || text.length > MAX_COMMENT_LENGTH) return;
    setCommentLoading(c => ({ ...c, [postId]: true }));
    await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.name, text }),
    });
    setCommentInputs(inputs => ({ ...inputs, [postId]: '' }));
    
    if (selectedCryptoFilter) {
      await fetchPostsByTag(selectedCryptoFilter);
    } else {
      await fetchPosts();
    }
    
    setCommentLoading(c => ({ ...c, [postId]: false }));
  };

  const toggleExpand = (postId: string, idx: number) => {
    setExpandedComments(exp => ({ ...exp, [`${postId}-${idx}`]: !exp[`${postId}-${idx}`] }));
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Vill du verkligen radera detta inlägg?')) return;
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    
    if (selectedCryptoFilter) {
      await fetchPostsByTag(selectedCryptoFilter);
    } else {
      await fetchPosts();
    }
  };
  
  const handleCryptoFilterClick = (cryptoId: string | null) => {
    setSelectedCryptoFilter(cryptoId);
  };

  const handleCryptoTagClick = (cryptoId: string) => {
    setSelectedCryptoFilter(cryptoId);
    // Scroll to top to show the filter has been applied
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start">
        <div className="w-full max-w-6xl mt-10 px-4 mx-auto">
          <h1 className="text-2xl font-bold mb-6 px-4">Explore</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Crypto Filter Sidebar */}
            <div className="md:w-1/4 w-full">
              <CryptoFilter 
                onCryptoSelect={handleCryptoFilterClick}
                onSortChange={handleSortChange}
                selectedCryptoId={selectedCryptoFilter}
                cryptocurrencies={cryptocurrencies}
                sortOption={sortOption}
                loading={cryptoLoading}
              />
            </div>
            
            {/* Posts Content */}
            <div className="md:w-3/4 w-full border border-gray-800 rounded-xl shadow bg-[#16181c]">              
              {/* Selected crypto info */}
              {selectedCryptoFilter && cryptocurrencies.length > 0 && (
                <div className="px-6 pt-6 pb-2 border-b border-gray-700">
                  {(() => {
                    const selectedCrypto = cryptocurrencies.find(c => c.id === selectedCryptoFilter);
                    if (selectedCrypto) {
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-8 h-8 mr-3 rounded-full" />
                            <div>
                              <h2 className="font-bold text-lg flex items-center">
                                {selectedCrypto.name}
                                <span className="text-gray-400 text-sm ml-2">{selectedCrypto.symbol.toUpperCase()}</span>
                              </h2>
                              <div className="flex items-center text-sm">
                                <span className={`${selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}{selectedCrypto.price_change_percentage_24h?.toFixed(2)}%
                                </span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-gray-400">#{selectedCrypto.market_cap_rank} Rank</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#2a2d36] py-1 px-3 rounded-full text-sm">
                            {posts.length} {posts.length === 1 ? 'inlägg' : 'inlägg'} nämner ${selectedCrypto.symbol.toUpperCase()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Post List */}
              <div className="px-6 pt-4 pb-6 sm:px-10">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400 mb-3">Inga inlägg ännu med {selectedCryptoFilter ? 'denna kryptovaluta' : ''}</p>
                    {selectedCryptoFilter && (
                      <button 
                        onClick={() => setSelectedCryptoFilter(null)}
                        className="text-blue-400 hover:underline"
                      >
                        Visa alla inlägg
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="space-y-8">
                    {posts.map(post => (
                      <li key={post._id} className="bg-[#16181c] border border-gray-800 rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                          {post.profileImage ? (
                            <img src={post.profileImage} alt="Profilbild" className="h-10 w-10 rounded-full object-cover bg-gray-700 border border-gray-600" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg">
                              <span>👤</span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{post.userId || 'Anonym'}</span>
                            </div>
                            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                          </div>
                        </div>

                        {/* Post Content with Enhanced Crypto Tags */}
                        <div 
                          className="mb-3 text-white text-base"
                          dangerouslySetInnerHTML={{ 
                            __html: formatPostTextWithCryptoMentions(post.text, post.cryptoTags) 
                          }}
                        />

                        {post.imageUrl && (
                          <div className="mb-3">
                            <img src={post.imageUrl} alt="Inläggsbild" className="w-full max-h-80 object-contain rounded-xl border border-gray-700 bg-black" />
                          </div>
                        )}
                        
                        {/* Crypto Tags */}
                        {post.cryptoTags && post.cryptoTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.cryptoTags.map((tag, index) => {
                              // Find the full crypto data for this tag
                              const cryptoData = cryptocurrencies.find(c => c.id === tag.cryptoId);
                              return (
                                <button 
                                  key={index}
                                  onClick={() => handleCryptoTagClick(tag.cryptoId)}
                                  className={`flex items-center gap-1 bg-[#22242a] px-2 py-1 rounded text-xs font-medium hover:bg-[#2a2d36] transition-colors
                                    ${selectedCryptoFilter === tag.cryptoId ? 'ring-1 ring-blue-500 bg-[#2a2d36]' : ''}`}
                                >
                                  {cryptoData?.image && (
                                    <img src={cryptoData.image} alt={tag.name} className="w-4 h-4 rounded-full" />
                                  )}
                                  <span className="text-blue-400">${tag.symbol.toUpperCase()}</span>
                                  {cryptoData && (
                                    <span className={`ml-1 ${cryptoData.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {cryptoData.price_change_percentage_24h >= 0 ? '+' : ''}
                                      {cryptoData.price_change_percentage_24h?.toFixed(1)}%
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 text-gray-400 text-sm mb-2">
                          <button
                            onClick={() => handleLike(post._id)}
                            className={`flex items-center gap-1 ${isLikedByUser(post) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'} transition ${likeLoading[post._id] ? 'opacity-50 pointer-events-none' : ''}`}
                            disabled={likeLoading[post._id]}
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
                        </div>
                        {/* Kommentarer */}
                        <div className="space-y-2 mb-2">
                          {post.comments && post.comments.length > 0 && post.comments.map((comment, idx) => {
                            const isLong = comment.text.length > SHORT_COMMENT_LENGTH;
                            const expanded = expandedComments[`${post._id}-${idx}`];
                            return (
                              <div key={idx} className="bg-[#22242a] rounded p-2 text-sm text-gray-200">
                                <span className="font-semibold">{comment.userId}</span>{' '}
                                <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                                <div>
                                  {isLong && !expanded
                                    ? <>{comment.text.slice(0, SHORT_COMMENT_LENGTH)}... <button className="text-blue-400 hover:underline" onClick={() => toggleExpand(post._id, idx)}>Läs mer</button></>
                                    : comment.text
                                  }
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Lägg till kommentar */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            className="flex-1 rounded bg-[#22242a] border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Skriv en kommentar..."
                            maxLength={MAX_COMMENT_LENGTH}
                            value={commentInputs[post._id] || ''}
                            onChange={e => setCommentInputs(inputs => ({ ...inputs, [post._id]: e.target.value }))}
                            disabled={commentLoading[post._id]}
                          />
                          <button
                            onClick={() => handleComment(post._id)}
                            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm ${commentLoading[post._id] ? 'opacity-50 pointer-events-none' : ''}`}
                            disabled={commentLoading[post._id]}
                          >
                            Kommentera
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-8 text-center">
                  <Link href="/post" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Skapa nytt inlägg
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage; 