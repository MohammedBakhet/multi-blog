"use client";
import React, { useState, useEffect } from 'react';
import Header from '../Header';

const CRYPTO_LEVELS = [
  { min: 0, label: 'Rookie', color: 'bg-gray-500' },
  { min: 5, label: 'Hodler', color: 'bg-blue-500' },
  { min: 15, label: 'Trader', color: 'bg-purple-500' },
  { min: 30, label: 'Whale', color: 'bg-yellow-400' },
  { min: 50, label: 'Legend', color: 'bg-gradient-to-r from-blue-400 to-purple-500' },
];

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [patching, setPatching] = useState(false);
  const [patchResult, setPatchResult] = useState<string | null>(null);
  const [stats, setStats] = useState({ posts: 0, likes: 0, comments: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [favoriteCrypto, setFavoriteCrypto] = useState('');
  const [bio, setBio] = useState('');
  const [currentName, setCurrentName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setProfileImage(data.profileImage || '');
        setCurrentName(data.name || '');
      } catch (error) {
        console.error('Fel vid hämtning av profil:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();

    // Hämta statistik och senaste inlägg
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/users/me/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentPosts(data.recentPosts);
          setFavoriteCrypto(data.favoriteCrypto || '');
          setBio(data.bio || '');
        }
      } catch (e) { /* ignore */ }
    };
    fetchStats();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setNewImage(null);
      setImagePreview(null);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_preset'); // byt till din preset
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    
    try {
      let imageUrl = profileImage;
      if (newImage) {
        imageUrl = (await uploadToCloudinary(newImage)) || profileImage;
      }
      
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profileImage: imageUrl }),
      });
      
      if (res.ok) {
        setSuccess('Profilen har uppdaterats!');
        setProfileImage(imageUrl);
        // Rensa förhandsvisningen efter sparande
        setImagePreview(null);
        setNewImage(null);

        // Gör även en PATCH mot /api/posts/by-user för att uppdatera alla inlägg med nytt namn och profilbild
        if (currentName !== name && stats.posts > 0) {
          const patchRes = await fetch('/api/posts/by-user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              oldUserId: currentName,
              newUserId: name,
              profileImage: imageUrl,
            }),
          });
          
          if (patchRes.ok) {
            setPatchResult('Alla inlägg har uppdaterats!');
          } else {
            throw new Error('Kunde inte uppdatera inlägg');
          }
        }

        setCurrentName(name);
      } else {
        throw new Error('Kunde inte uppdatera profilen');
      }
    } catch (error) {
      console.error('Fel vid uppdatering:', error);
      setSuccess('Ett fel inträffade. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  // Beräkna crypto-nivå
  const level = CRYPTO_LEVELS.slice().reverse().find(l => stats.posts >= l.min) || CRYPTO_LEVELS[0];

  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden bg-[#181a20]">
      {/* Bakgrundsanimation */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start pt-24 relative z-10">
        <div className="w-full max-w-4xl p-8 border border-blue-900/30 rounded-2xl shadow-2xl bg-black/80 animate-fadeIn backdrop-blur-md flex flex-col md:flex-row gap-8">
          {/* Vänster kolumn */}
          <div className="md:w-1/3 flex flex-col items-center gap-6">
            <div className="relative group">
              <img
                src={imagePreview || profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=384d7c&color=fff`}
                alt="Profilbild"
                className="w-32 h-32 rounded-full object-cover border-2 border-blue-700 bg-black transition-transform hover:scale-105 shadow-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {name || 'Ditt crypto-namn'}
            </h1>
            <span className={`px-4 py-1 rounded-full text-sm font-bold text-white shadow ${level.color}`}>{level.label}</span>
            <div className="flex gap-6 mt-2 text-center">
              <div>
                <div className="text-lg font-bold">{stats.posts}</div>
                <div className="text-xs text-gray-400">Inlägg</div>
              </div>
              <div>
                <div className="text-lg font-bold">{stats.likes}</div>
                <div className="text-xs text-gray-400">Likes</div>
              </div>
              <div>
                <div className="text-lg font-bold">{stats.comments}</div>
                <div className="text-xs text-gray-400">Kommentarer</div>
              </div>
            </div>
          </div>
          {/* Höger kolumn */}
          <div className="md:w-2/3 flex flex-col gap-6">
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1 text-gray-300">Användarnamn</label>
              <input
                type="text"
                className="w-full rounded-lg bg-[#22242a] border border-blue-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-2"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ditt crypto-namn"
                required
              />
              <label className="block text-sm font-medium mb-1 text-gray-300">Favoritkryptovaluta</label>
              <input
                type="text"
                className="w-full rounded-lg bg-[#22242a] border border-blue-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-2"
                value={favoriteCrypto}
                onChange={e => setFavoriteCrypto(e.target.value)}
                placeholder="T.ex. Bitcoin, Ethereum, Solana..."
              />
              <label className="block text-sm font-medium mb-1 text-gray-300">Om mig & krypto</label>
              <textarea
                className="w-full rounded-lg bg-[#22242a] border border-blue-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Berätta om ditt intresse för krypto..."
                rows={2}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2 text-blue-400">Senaste inlägg</h2>
              {recentPosts.length === 0 ? (
                <div className="text-gray-400 text-sm">Du har inte postat något ännu.</div>
              ) : (
                <ul className="space-y-2">
                  {recentPosts.slice(0, 3).map((post, idx) => (
                    <li key={post._id || idx} className="bg-[#22242a] rounded-lg px-4 py-3 text-sm text-white border border-blue-900/30">
                      <span className="font-semibold">{post.text.slice(0, 60)}{post.text.length > 60 ? '...' : ''}</span>
                      <div className="text-xs text-gray-400 mt-1">{new Date(post.createdAt).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-5 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">E-post</label>
                  <input
                    type="email"
                    className="w-full rounded-lg bg-[#22242a] border border-blue-700 px-4 py-3 text-white opacity-60"
                    value={email}
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">E-postadressen kan inte ändras</p>
                </div>
              </div>
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all btn-hover-effect disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sparar...
                    </span>
                  ) : "Spara ändringar"}
                </button>
                {success && (
                  <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-100 px-4 py-3 rounded-lg animate-fadeIn text-center">
                    {success}
                  </div>
                )}
                {patchResult && (
                  <div className="bg-blue-500 bg-opacity-20 border border-blue-400 text-blue-100 px-4 py-3 rounded-lg animate-fadeIn text-center mt-2">
                    {patchResult}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 