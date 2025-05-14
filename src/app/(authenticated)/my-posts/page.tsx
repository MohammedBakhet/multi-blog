"use client";
import React, { useState } from 'react';
import Link from 'next/link';

// Dummy data för användarens inlägg
const MY_POSTS = [
  {
    id: 1,
    title: "Min första bloggpost",
    excerpt: "Detta är min allra första bloggpost på Multi-Blog plattformen.",
    date: "2023-09-20",
    status: "published",
    likes: 12,
    comments: 3,
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Mina tankar om webbutveckling",
    excerpt: "Webbutveckling är ett fascinerande område som ständigt utvecklas. Här delar jag mina tankar.",
    date: "2023-09-15",
    status: "published",
    likes: 8,
    comments: 2,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Utkast: Kommande projekt",
    excerpt: "En överblick över mina kommande projekt inom programmering och design.",
    date: "2023-09-10",
    status: "draft",
    likes: 0,
    comments: 0,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
  }
];

export default function MyPosts() {
  const [filter, setFilter] = useState("all"); // "all", "published", "draft"
  
  const filteredPosts = filter === "all" 
    ? MY_POSTS 
    : MY_POSTS.filter(post => post.status === filter);

  const handleDelete = (id: number) => {
    // I en verklig app skulle detta göra ett API-anrop för att ta bort inlägget
    alert(`Ta bort inlägg ${id}. I en verklig app skulle detta ta bort inlägget.`);
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Mina inlägg</h1>
          <Link 
            href="/create" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            Skapa nytt inlägg
          </Link>
        </div>
        
        {/* Filter */}
        <div className="flex space-x-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-md ${filter === "all" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setFilter("all")}
          >
            Alla inlägg
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${filter === "published" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setFilter("published")}
          >
            Publicerade
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${filter === "draft" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            onClick={() => setFilter("draft")}
          >
            Utkast
          </button>
        </div>
        
        {/* Lista med inlägg */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 h-48 md:h-auto">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-3/4 flex flex-col">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold text-white">{post.title}</h2>
                      <span className={`text-xs px-2 py-1 rounded ${post.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {post.status === 'published' ? 'Publicerad' : 'Utkast'}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{post.excerpt}</p>
                    <div className="text-sm text-gray-400 mb-4">
                      Publicerad: {post.date}
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
                    <Link 
                      href={`/posts/${post.id}`} 
                      className="px-3 py-1 bg-blue-800 hover:bg-blue-700 text-blue-100 rounded transition"
                    >
                      Visa
                    </Link>
                    <Link 
                      href={`/edit/${post.id}`} 
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition"
                    >
                      Redigera
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded transition"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Om inga inlägg hittades */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Inga {filter === "all" ? "" : filter === "published" ? "publicerade " : "utkast till "}inlägg hittades
            </h3>
            <p className="text-gray-400 mb-6">Börja med att skapa ditt första inlägg</p>
            <Link 
              href="/create" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
            >
              Skapa nytt inlägg
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 