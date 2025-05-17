"use client";
import React, { useState, useEffect } from 'react';
import Header from '../Header';

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

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setProfileImage(data.profileImage || '');
      } catch (error) {
        console.error('Fel vid hämtning av profil:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
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

  // Funktion för att uppdatera gamla inlägg
  const handlePatchOldPosts = async () => {
    setPatching(true);
    setPatchResult(null);
    
    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldUserId: 'demo-user',
          newUserId: name,
          profileImage: profileImage,
        }),
      });
      
      const data = await res.json();
      setPatchResult(data.updatedCount ? `Uppdaterade ${data.updatedCount} inlägg!` : 'Inga inlägg uppdaterades.');
    } catch (error) {
      console.error('Fel vid uppdatering av inlägg:', error);
      setPatchResult('Ett fel inträffade vid uppdatering av inlägg');
    } finally {
      setPatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start pt-24">
        <div className="w-full max-w-lg p-8 border border-gray-800 rounded-xl shadow-lg bg-[#16181c] animate-fadeIn">
          <h1 className="text-2xl font-bold mb-6 gradient-text">Min profil</h1>
          
          {fetching ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <img
                    src={imagePreview || profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=384d7c&color=fff`}
                    alt="Profilbild"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-700 bg-black transition-transform hover:scale-105 shadow-lg"
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
                {newImage && (
                  <p className="text-blue-400 text-sm">Ny bild vald. Spara för att uppdatera.</p>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Namn</label>
                  <input
                    type="text"
                    className="w-full rounded-lg bg-[#22242a] border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={40}
                    placeholder="Ditt namn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">E-post</label>
                  <input
                    type="email"
                    className="w-full rounded-lg bg-[#22242a] border border-gray-700 px-4 py-3 text-white opacity-60"
                    value={email}
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">E-postadressen kan inte ändras</p>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all btn-hover-effect disabled:opacity-60 disabled:cursor-not-allowed font-medium"
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
                
                <button
                  type="button"
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-all btn-hover-effect disabled:opacity-60 disabled:cursor-not-allowed font-medium mt-2"
                  onClick={handlePatchOldPosts}
                  disabled={patching}
                >
                  {patching ? 'Uppdaterar gamla inlägg...' : 'Uppdatera gamla inlägg med nytt namn & profilbild'}
                </button>
                
                {patchResult && (
                  <div className="bg-blue-500 bg-opacity-20 border border-blue-400 text-blue-100 px-4 py-3 rounded-lg animate-fadeIn text-center mt-2">
                    {patchResult}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 