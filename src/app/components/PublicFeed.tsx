import React, { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  snippet: string;
}

// Mock data for demonstration
const MOCK_POSTS: Post[] = [
  { id: 1, title: "Welcome to Multi-Blog!", snippet: "This is a public post. Log in to see more!" },
  { id: 2, title: "Another Post", snippet: "You can only see a preview until you log in." },
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
    <div className="w-full h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Latest Posts</h2>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id} className="bg-white bg-opacity-10 rounded p-4 border border-white border-opacity-20">
            <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
            <p className="text-white text-opacity-80">{post.snippet}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-white text-opacity-70 text-sm">
        Log in to comment, like, and see full posts.
      </div>
    </div>
  );
} 