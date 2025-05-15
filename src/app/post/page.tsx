'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Header from '../(authenticated)/Header';

interface Post {
  _id?: string;
  text: string;
  imageUrl?: string;
  userId?: string;
  likes?: string[];
  comments?: { userId: string; text: string; createdAt: string }[];
  createdAt?: string;
  profileImage?: string;
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

  // Lista på möjliga gamla namn (lägg till fler om du haft flera)
  const oldNames = ["demo-user"];

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
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
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
    setLoading(false);
    fetchPosts();
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
            <h1 className="text-2xl font-bold mb-0">New Post</h1>
          </div>
          <form onSubmit={handlePost} className="flex flex-col gap-0 px-6 pt-4 pb-6 sm:px-10">
            <textarea
              className="w-full bg-transparent text-lg text-gray-200 placeholder-gray-400 border-none outline-none resize-none min-h-[80px] mb-4"
              placeholder="What's happening?"
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={280}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="max-h-40 object-contain rounded border border-gray-700 bg-black mb-4" />
            )}
            <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-2">
              <label className="cursor-pointer flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400 hover:text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2.003 2.003 0 002 2h14a2.003 2.003 0 002-2v-2.5M16.5 3.75l-9 9m0 0V15h2.25m-2.25-2.25H9m7.5-7.5a2.121 2.121 0 113 3l-9 9a2.121 2.121 0 01-3-3l9-9z" />
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
                className={`bg-[#384d7c] text-white font-semibold px-6 py-2 rounded-full transition ${!input.trim() || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2c3a5a]'}`}
                disabled={!input.trim() || loading}
              >
                Post
              </button>
            </div>
          </form>
          <h2 className="text-xl font-semibold mb-4">Senaste inlägg</h2>
          <ul className="space-y-4">
            {posts
              .filter(post => [user?.name, ...oldNames].includes(post.userId || ""))
              .map(post => (
                <li key={post._id} className="border-b border-gray-700 pb-2 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {post.profileImage ? (
                        <img src={post.profileImage} alt="Profilbild" className="h-8 w-8 rounded-full object-cover bg-gray-700 border border-gray-600" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-base">
                          <span>👤</span>
                        </div>
                      )}
                      <span className="font-semibold text-white text-sm">{post.userId}</span>
                    </div>
                    <div>{post.text}</div>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="Inläggsbild" className="max-h-40 object-contain rounded my-2" />
                    )}
                    <div className="text-xs text-gray-400">{post.createdAt && new Date(post.createdAt).toLocaleString('sv-SE')}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                  >
                    Radera
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default PostPage; 