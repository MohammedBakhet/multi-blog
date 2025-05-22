"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Header from '../Header';
import { Cryptocurrency, CryptoSortOption, CryptoPostTag } from '../../../lib/cryptoTypes';
import CryptoFilter from './components/CryptoFilter';
import { FaFilter } from 'react-icons/fa';

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
  
  cryptoTags.forEach(tag => {
    const regex = new RegExp(`\\$${tag.symbol}\\b`, 'gi');
    formattedText = formattedText.replace(regex, `<span class="text-blue-400 font-medium cursor-pointer hover:underline">$${tag.symbol.toUpperCase()}</span>`);
    
    
    const nameRegex = new RegExp(`\\b${tag.name}\\b`, 'gi');
    formattedText = formattedText.replace(nameRegex, `<span class="text-blue-400 font-medium cursor-pointer hover:underline">${tag.name}</span>`);
  });
  
  return formattedText;
};

const ExplorePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 5;
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [likeLoading, setLikeLoading] = useState<{ [key: string]: boolean }>({});
  const [commentLoading, setCommentLoading] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<User | null>(null);
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [selectedCryptoFilter, setSelectedCryptoFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<CryptoSortOption>(CryptoSortOption.MARKET_CAP);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterOption, setFilterOption] = useState<'latest' | 'mostLiked'>('latest');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchPosts();
    fetchCryptocurrencies();
  }, []);
  
  useEffect(() => {
   
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

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=${POSTS_PER_PAGE}`);
      const data = await res.json();
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setHasMore(data.posts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const fetchPostsByTag = async (cryptoId: string, pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const res = await fetch(`/api/posts?cryptoTag=${cryptoId}&page=${pageNum}&limit=${POSTS_PER_PAGE}`);
    const data = await res.json();
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setHasMore(data.posts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
    setLoading(false);
      setLoadingMore(false);
    }
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

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    
    if (selectedCryptoFilter) {
      await fetchPostsByTag(selectedCryptoFilter, nextPage, true);
    } else {
      await fetchPosts(nextPage, true);
    }
  };

  // Filtrera kryptovalutor baserat på sökterm
  const filteredCryptos = searchTerm
    ? cryptocurrencies.filter(crypto =>
        crypto.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Hantera klick på sökikonen i Headern
  const handleSearchIconClick = () => {
    setSearchOpen(!searchOpen);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 100);
  };

  // Stäng sök-dropdown vid klick utanför
  useEffect(() => {
    if (!searchOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        searchInputRef.current &&
        !(searchInputRef.current as any).parentNode.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [searchOpen]);

  const getFilteredPosts = () => {
    let filtered = posts ? [...posts] : [];
    if (filterOption === 'mostLiked') {
      filtered.sort((a, b) => ((b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0)));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }
    return filtered;
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!filterDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterDropdownOpen]);

  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden bg-[#181a20]">
      <Header onSearchIconClick={handleSearchIconClick} />
      {/* Sök-dropdown */}
      {searchOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 flex flex-col items-center">
          <div className="w-full max-w-xl bg-[#22242a] border border-blue-900/30 rounded-xl shadow-lg p-4 flex flex-col gap-2 animate-fadeIn">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full rounded-lg bg-[#181a20] border border-blue-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Sök kryptovaluta..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-700/50 mt-2">
                {filteredCryptos.length === 0 ? (
                  <li className="text-gray-400 px-4 py-2">Inga kryptovalutor hittades</li>
                ) : (
                  filteredCryptos.map(crypto => (
                    <li
                      key={crypto.id}
                      className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[#23252c] rounded transition"
                      onClick={() => {
                        setSelectedCryptoFilter(crypto.id);
                        setSearchOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <img src={crypto.image} alt={crypto.name} className="w-7 h-7 rounded-full" />
                      <span className="font-medium text-white">{crypto.name}</span>
                      <span className="text-gray-400 text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-700/50">{crypto.symbol.toUpperCase()}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Grid layout: filter + feed */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8 z-10 relative mt-24">
        {/* Flytande filter-knapp */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>

        {/* Ihopfällbar CryptoFilter */}
        <aside className={`fixed md:sticky top-0 left-0 h-full w-80 bg-gradient-to-br from-[#1a1c23] to-[#22242a] transform transition-transform duration-300 ease-in-out z-40
          ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          md:top-32 md:self-start md:z-20`}>
          <div className="relative h-full">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <CryptoFilter
              onCryptoSelect={handleCryptoFilterClick}
              onSortChange={handleSortChange}
              selectedCryptoId={selectedCryptoFilter}
              cryptocurrencies={cryptocurrencies}
              sortOption={sortOption}
              loading={cryptoLoading}
            />
          </div>
        </aside>

        {/* Feed med full bredd när filtret är stängt */}
        <section className={`w-full transition-all duration-300 ${isFilterOpen ? 'md:ml-80' : ''}`}>
          {/* Filter button with icon */}
          <div className="flex justify-end items-center mb-4 relative">
            <button
              ref={filterButtonRef}
              onClick={() => setFilterDropdownOpen((open) => !open)}
              className="flex items-center gap-2 px-4 py-2 bg-[#22242a] border border-blue-700 text-white rounded-lg hover:bg-blue-900/30 transition focus:outline-none"
            >
              <FaFilter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtrera</span>
            </button>
            {filterDropdownOpen && (
              <div
                ref={filterDropdownRef}
                className="absolute right-0 top-full mt-2 w-44 bg-[#22242a] border border-blue-700 rounded-lg shadow-lg z-50"
              >
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-blue-900/30 rounded-t-lg ${filterOption === 'latest' ? 'bg-blue-900/20 font-bold' : ''}`}
                  onClick={() => { setFilterOption('latest'); setFilterDropdownOpen(false); }}
                >
                  Senaste
                </button>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-blue-900/30 rounded-b-lg ${filterOption === 'mostLiked' ? 'bg-blue-900/20 font-bold' : ''}`}
                  onClick={() => { setFilterOption('mostLiked'); setFilterDropdownOpen(false); }}
                >
                  Mest gillade
                </button>
              </div>
            )}
          </div>
          {/* Selected crypto info */}
          {selectedCryptoFilter && cryptocurrencies.length > 0 && (
            <div className="px-6 pt-6 pb-2 border-b border-gray-700 mb-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 shadow">
              {(() => {
                const selectedCrypto = cryptocurrencies.find(c => c.id === selectedCryptoFilter);
                if (selectedCrypto) {
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-10 h-10 mr-4 rounded-full border-2 border-blue-500 shadow" />
                        <div>
                          <h2 className="font-bold text-xl flex items-center">
                            {selectedCrypto.name}
                            <span className="text-gray-400 text-base ml-2">{selectedCrypto.symbol.toUpperCase()}</span>
                          </h2>
                          <div className="flex items-center text-sm mt-1">
                            <span className={`${selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                              {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}{selectedCrypto.price_change_percentage_24h?.toFixed(2)}%
                            </span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-gray-400">#{selectedCrypto.market_cap_rank} Rank</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-600/80 py-1 px-4 rounded-full text-sm font-bold text-white shadow">
                        {posts.length} {posts.length === 1 ? 'inlägg' : 'inlägg'} nämner ${selectedCrypto.symbol.toUpperCase()}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
          {/* Feed posts */}
          <div className="px-2 pt-4 pb-6 sm:px-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              </div>
            ) : getFilteredPosts().length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-3 text-lg">Inga inlägg ännu med {selectedCryptoFilter ? 'denna kryptovaluta' : ''}</p>
                {selectedCryptoFilter && (
                  <button
                    onClick={() => setSelectedCryptoFilter(null)}
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    Visa alla inlägg
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-8">
                {getFilteredPosts().map(post => (
                  <li key={post._id} className="bg-[#181a20] border border-blue-900/30 rounded-xl p-6 shadow-md hover:shadow-2xl transition-shadow duration-300 group relative overflow-hidden">
                    {/* Bakgrundsdekor för varje post */}
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-700 opacity-10 rounded-full blur-2xl z-0"></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
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
                        <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    {/* Post Content with Enhanced Crypto Tags */}
                    <div
                      className="mb-3 text-white text-base relative z-10"
                      dangerouslySetInnerHTML={{
                        __html: formatPostTextWithCryptoMentions(post.text, post.cryptoTags)
                      }}
                    />
                    {post.imageUrl && (
                      <div className="mb-3 relative z-10">
                        <img src={post.imageUrl} alt="Inläggsbild" className="w-full max-h-80 object-contain rounded-xl border border-blue-900/30 bg-black" />
                      </div>
                    )}
                    {/* Crypto Tags */}
                    {post.cryptoTags && post.cryptoTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 relative z-10">
                        {post.cryptoTags.map((tag, index) => {
                          const cryptoData = cryptocurrencies.find(c => c.id === tag.cryptoId);
                          return (
                            <button
                              key={index}
                              onClick={() => handleCryptoTagClick(tag.cryptoId)}
                              className={`flex items-center gap-1 bg-gradient-to-r from-blue-700 to-purple-700 px-2 py-1 rounded text-xs font-bold hover:scale-105 transition-transform
                                ${selectedCryptoFilter === tag.cryptoId ? 'ring-2 ring-blue-400' : ''}`}
                            >
                              {cryptoData?.image && (
                                <img src={cryptoData.image} alt={tag.name} className="w-4 h-4 rounded-full" />
                              )}
                              <span className="text-blue-200">${tag.symbol.toUpperCase()}</span>
                              {cryptoData && (
                                <span className={`ml-1 ${cryptoData.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {cryptoData.price_change_percentage_24h >= 0 ? '+' : ''}
                                  {cryptoData.price_change_percentage_24h?.toFixed(1)}%
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-gray-400 text-sm mb-2 relative z-10">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1 ${isLikedByUser(post) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'} transition`}
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
                    <div className="space-y-2 mb-2 relative z-10">
                      {post.comments && post.comments.length > 0 && post.comments.map((comment, idx) => {
                        const isLong = comment.text.length > SHORT_COMMENT_LENGTH;
                        const expanded = expandedComments[`${post._id}-${idx}`];
                        return (
                          <div key={idx} className="bg-[#22242a] rounded p-2 text-sm text-gray-200">
                            <span className="font-semibold">{comment.userId}</span>{' '}
                            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                            <div>
                              {isLong && !expanded
                                ? <>{comment.text.slice(0, SHORT_COMMENT_LENGTH)}... <button className="text-blue-400 hover:underline" onClick={() => toggleExpand(post._id, idx)}>Visa mer</button></>
                                : <>{comment.text} {isLong && <button className="text-blue-400 hover:underline" onClick={() => toggleExpand(post._id, idx)}>Visa mindre</button>}</>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Kommentera */}
                    <form onSubmit={e => { e.preventDefault(); handleComment(post._id); }} className="flex items-center gap-2 mt-2 relative z-10">
                      <input
                        type="text"
                        className="flex-1 rounded-lg bg-[#22242a] border border-blue-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Skriv en kommentar..."
                        value={commentInputs[post._id] || ''}
                        onChange={e => setCommentInputs(inputs => ({ ...inputs, [post._id]: e.target.value }))}
                        maxLength={MAX_COMMENT_LENGTH}
                        disabled={commentLoading[post._id]}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={commentLoading[post._id] || !commentInputs[post._id]?.trim()}
                      >
                        {commentLoading[post._id] ? 'Skickar...' : 'Kommentera'}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Ladda fler knapp */}
          {!loading && posts.length > 0 && hasMore && (
            <div className="flex justify-center mt-8 mb-12">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium
                         hover:from-blue-700 hover:to-purple-700 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2 group"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Laddar...
                  </>
                ) : (
                  <>
                    Ladda fler inlägg
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-y-0.5 transition-transform" 
                         viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Inga fler inlägg meddelande */}
          {!loading && posts.length > 0 && !hasMore && (
            <div className="text-center py-8 text-gray-400">
              <p>Inga fler inlägg att visa</p>
          </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ExplorePage; 