"use client";
import React, { useState, useEffect } from 'react';
// import Header from '../Header';

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
      const res = await fetch('/api/users/me');
      const data = await res.json();
      setName(data.name || '');
      setEmail(data.email || '');
      setProfileImage(data.profileImage || '');
      setFetching(false);
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
    let imageUrl = profileImage;
    if (newImage) {
      imageUrl = (await uploadToCloudinary(newImage)) || profileImage;
    }
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, profileImage: imageUrl }),
    });
    setLoading(false);
    window.location.reload();
  };

  // Funktion för att uppdatera gamla inlägg
  const handlePatchOldPosts = async () => {
    setPatching(true);
    setPatchResult(null);
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
    setPatching(false);
    setPatchResult(data.updatedCount ? `Uppdaterade ${data.updatedCount} inlägg!` : 'Inga inlägg uppdaterades.');
  };

  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      {/* <Header /> */}
      <main className="flex-grow flex flex-col items-center justify-start">
        <div className="w-full max-w-md mt-10 p-6 border border-gray-800 rounded-xl shadow bg-[#16181c]">
          <h1 className="text-2xl font-bold mb-6">Min profil</h1>
          {fetching ? (
            <div className="text-center text-gray-400">Laddar profil...</div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={imagePreview || profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name)}
                  alt="Profilbild"
                  className="w-24 h-24 rounded-full object-cover border border-gray-700 bg-black"
                />
                <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Namn</label>
                <input
                  type="text"
                  className="w-full rounded bg-[#22242a] border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">E-post</label>
                <input
                  type="email"
                  className="w-full rounded bg-[#22242a] border border-gray-700 px-3 py-2 text-white opacity-60"
                  value={email}
                  disabled
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Sparar...' : 'Spara ändringar'}
              </button>
              {success && <div className="text-green-400 text-sm text-center">{success}</div>}
              <button
                type="button"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition mt-2"
                onClick={handlePatchOldPosts}
                disabled={patching}
              >
                {patching ? 'Uppdaterar gamla inlägg...' : 'Uppdatera gamla inlägg med nytt namn & profilbild'}
              </button>
              {patchResult && <div className="text-blue-400 text-sm text-center mt-2">{patchResult}</div>}
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 