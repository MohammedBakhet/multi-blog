"use client";
import React, { useState } from 'react';
import Link from 'next/link';

// Dummy data för inlägg
const DUMMY_POSTS = [
  {
    id: 1,
    title: "Hur man bygger en Next.js-app med Tailwind CSS",
    excerpt: "En guide för att komma igång med Next.js och Tailwind CSS för moderna webbapplikationer.",
    author: "Anna Andersson",
    authorImage: "/images/avatar-1.jpg",
    date: "2023-09-15",
    tags: ["Next.js", "Tailwind", "React"],
    likes: 42,
    comments: 8,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Mina tankar om TypeScript i 2023",
    excerpt: "Varför TypeScript har blivit oumbärligt för moderna JavaScript-projekt och hur du kan dra nytta av det.",
    author: "Erik Eriksson",
    authorImage: "/images/avatar-2.jpg",
    date: "2023-09-10",
    tags: ["TypeScript", "JavaScript", "Utveckling"],
    likes: 35,
    comments: 12,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Att arbeta med API:er i React",
    excerpt: "Bästa praxis för att integrera externa API:er i dina React-applikationer.",
    author: "Maria Nilsson",
    authorImage: "/images/avatar-3.jpg",
    date: "2023-09-05",
    tags: ["React", "API", "Frontend"],
    likes: 28,
    comments: 5,
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Min resa som utvecklare: Från nybörjare till senior",
    excerpt: "Reflektioner och lärdomar från min karriär inom webbutveckling.",
    author: "Johan Svensson",
    authorImage: "/images/avatar-4.jpg",
    date: "2023-08-28",
    tags: ["Karriär", "Utveckling", "Personlig utveckling"],
    likes: 56,
    comments: 15,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    title: "Introduktion till GraphQL",
    excerpt: "Varför GraphQL kan vara ett bättre alternativ än REST för dina API-behov.",
    author: "Lisa Lindgren",
    authorImage: "/images/avatar-5.jpg",
    date: "2023-08-20",
    tags: ["GraphQL", "API", "Backend"],
    likes: 31,
    comments: 7,
    image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80"
  }
];

// Kategorier för filtrering
const CATEGORIES = [
  "Alla", "Utveckling", "Design", "Karriär", "Teknologi", "AI", "Webbutveckling", "Mobile"
];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState("Alla");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrering av inlägg baserat på kategori och sökfråga
  const filteredPosts = DUMMY_POSTS.filter(post => {
    const matchesCategory = activeCategory === "Alla" || post.tags.some(tag => tag.toLowerCase().includes(activeCategory.toLowerCase()));
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero-sektion */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl shadow-xl p-8 mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Utforska inlägg</h1>
          <p className="text-blue-100 text-lg max-w-3xl">
            Upptäck intressanta inlägg från vår community. Hitta inspiration, kunskap och nya perspektiv.
          </p>
          
          {/* Sökfält */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Sök efter inlägg, taggar eller författare..."
                className="w-full px-4 py-3 pl-12 rounded-full bg-black bg-opacity-50 border border-blue-400 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-4 top-3.5 text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Kategorier */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Inläggsgrid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition hover:shadow-blue-900/20 hover:translate-y-[-2px]">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold bg-blue-900 text-blue-200 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                <p className="text-gray-300 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                      <span className="text-xs">👤</span>
                    </div>
                    <span className="text-sm text-gray-300">{post.author}</span>
                  </div>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
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
                  <Link 
                    href={`/posts/${post.id}`} 
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Läs mer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Om inga inlägg hittades */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Inga inlägg hittades</h3>
            <p className="text-gray-400">Försök med en annan sökterm eller kategori</p>
          </div>
        )}
        
        {/* Pagination */}
        <div className="mt-10 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">
              Föregående
            </button>
            <button className="px-3 py-2 rounded-md bg-blue-600 text-white">1</button>
            <button className="px-3 py-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">2</button>
            <button className="px-3 py-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">3</button>
            <span className="px-3 py-2 text-gray-400">...</span>
            <button className="px-3 py-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">10</button>
            <button className="px-3 py-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">
              Nästa
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
} 