"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../Header';

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

const ExplorePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [likeLoading, setLikeLoading] = useState<{ [key: string]: boolean }>({});
  const [commentLoading, setCommentLoading] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

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

  const handleLike = async (postId: string) => {
    if (!user) return;
    setLikeLoading(l => ({ ...l, [postId]: true }));
    await fetch(`/api/posts/${postId}/like`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.name }),
    });
    await fetchPosts();
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
    await fetchPosts();
    setCommentLoading(c => ({ ...c, [postId]: false }));
  };

  const toggleExpand = (postId: string, idx: number) => {
    setExpandedComments(exp => ({ ...exp, [`${postId}-${idx}`]: !exp[`${postId}-${idx}`] }));
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Vill du verkligen radera detta inlägg?')) return;
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    await fetchPosts();
  };

  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start">
        <div className="w-full max-w-2xl mt-10 p-0 border border-gray-800 rounded-xl shadow bg-[#16181c] mx-auto sm:px-0 px-0">
          <div className="px-6 pt-6 pb-2 border-b border-gray-800">
            <h1 className="text-2xl font-bold mb-0">Explore</h1>
          </div>
          <div className="px-6 pt-4 pb-6 sm:px-10">
            {loading ? (
              <p>Laddar inlägg...</p>
            ) : posts.length === 0 ? (
              <p>Inga inlägg ännu.</p>
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
                    <div className="mb-3 text-white text-base">
                      {post.text}
                    </div>
                    {post.imageUrl && (
                      <div className="mb-3">
                        <img src={post.imageUrl} alt="Inläggsbild" className="w-full max-h-80 object-contain rounded-xl border border-gray-700 bg-black" />
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-gray-400 text-sm mb-2">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1 hover:text-pink-500 transition ${likeLoading[post._id] ? 'opacity-50 pointer-events-none' : ''}`}
                        disabled={likeLoading[post._id]}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
              <Link href="/post" className="text-blue-600 hover:underline">Posta ett nytt inlägg</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage; 