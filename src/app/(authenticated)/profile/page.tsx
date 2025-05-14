"use client";
import React, { useState } from 'react';

// Dummy användardata
const USER = {
  name: "Anna Svensson",
  email: "anna@example.com",
  bio: "Webbutvecklare och skribent med passion för nya teknologier.",
  avatarUrl: "",
  joinDate: "2023-01-15",
  postsCount: 8,
  likesReceived: 42,
  commentsReceived: 15
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: USER.name,
    email: USER.email,
    bio: USER.bio,
    avatarUrl: USER.avatarUrl,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validera lösenord om användaren försöker ändra det
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Lösenorden matchar inte.' });
        return;
      }
    }
    
    // I en verklig app skulle detta göra ett API-anrop
    try {
      // Simulera API-anrop
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Uppdatera USER-objektet med nya värden (i en verklig app skulle detta komma från servern)
      Object.assign(USER, {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl
      });
      
      setMessage({ type: 'success', text: 'Profilen uppdaterades framgångsrikt!' });
      setIsEditing(false);
      
      // Återställ lösenordsfälten
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Något gick fel. Försök igen senare.' });
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Min profil</h1>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          {/* Profilöversikt */}
          {!isEditing && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-5xl text-gray-400">
                  {USER.avatarUrl ? (
                    <img 
                      src={USER.avatarUrl} 
                      alt={USER.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{USER.name.charAt(0)}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2 text-center md:text-left">{USER.name}</h2>
                  <p className="text-gray-400 mb-4 text-center md:text-left">{USER.email}</p>
                  <p className="text-gray-300 mb-6">{USER.bio || "Ingen biografi tillagd."}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700 p-4 rounded-md text-center">
                      <p className="text-gray-400 text-sm">Medlem sedan</p>
                      <p className="text-white font-semibold">{new Date(USER.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-md text-center">
                      <p className="text-gray-400 text-sm">Inlägg</p>
                      <p className="text-white font-semibold">{USER.postsCount}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-md text-center">
                      <p className="text-gray-400 text-sm">Likes</p>
                      <p className="text-white font-semibold">{USER.likesReceived}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-md text-center">
                      <p className="text-gray-400 text-sm">Kommentarer</p>
                      <p className="text-white font-semibold">{USER.commentsReceived}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                    >
                      Redigera profil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Redigeringsformulär */}
          {isEditing && (
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-2">Namn</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2">E-post</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="bio" className="block text-gray-300 mb-2">Biografi</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="avatarUrl" className="block text-gray-300 mb-2">Profilbild URL</label>
                  <input
                    type="url"
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://exempel.com/min-bild.jpg"
                  />
                </div>
                
                <div className="bg-gray-700 p-4 rounded-md mb-6">
                  <h3 className="text-white font-semibold mb-4">Ändra lösenord (valfritt)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-gray-300 mb-2">Nuvarande lösenord</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-gray-300 mb-2">Nytt lösenord</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">Bekräfta nytt lösenord</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: USER.name,
                        email: USER.email,
                        bio: USER.bio,
                        avatarUrl: USER.avatarUrl,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setMessage({ type: '', text: '' });
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                  >
                    Spara ändringar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 