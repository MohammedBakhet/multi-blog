import React, { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  snippet: string;
}

// Mock data for demonstration
const MOCK_POSTS: Post[] = [
  { id: 1, title: "Välkommen till CryptoTalk!", snippet: "Detta är en publik crypto-diskussion. Logga in för att delta och se mer!" },
  { id: 2, title: "Vad tror du om Bitcoin 2024?", snippet: "Diskutera trender, nyheter och prisutveckling med andra entusiaster." },
];

export default function PublicFeed() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  // Simulate polling for new posts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, fetch('/api/public-feed') here
      setPosts([...MOCK_POSTS]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-8 overflow-y-auto bg-gradient-to-br from-blue-900/60 via-indigo-900/60 to-purple-900/60 rounded-2xl shadow-xl border border-blue-900/30 backdrop-blur-md">
      <h2 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Publika crypto-diskussioner
      </h2>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id} className="bg-black/60 rounded-xl p-6 border border-blue-900/30 shadow-md">
            <h3 className="text-lg font-bold text-blue-300 mb-2">{post.title}</h3>
            <p className="text-white text-opacity-90">{post.snippet}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 text-center text-white text-opacity-80 text-base">
        <span className="block mb-2">Logga in för att kommentera, gilla och se hela crypto-communityn!</span>
        <span className="text-blue-400 font-semibold">Bli en del av CryptoTalk idag.</span>
      </div>
    </div>
  );
} 