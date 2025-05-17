'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../../hooks/useChatbot';

export default function ChatbotWidget() {
  const { messages, isLoading, error, sendMessage, clearConversation } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scrolla ner när nya meddelanden kommer in
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Fokusera på input när chatten öppnas
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userInput = inputValue;
    setInputValue('');
    await sendMessage(userInput);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chatbot-knapp */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        aria-label={isOpen ? 'Stäng chatbot' : 'Öppna chatbot'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-gray-900 rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-700">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </div>
              <h3 className="text-white font-medium">Crypto Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearConversation} 
                className="text-gray-400 hover:text-white"
                title="Rensa konversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Meddelandeområde */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-800 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Hej! Jag är din Crypto Assistant. Hur kan jag hjälpa dig idag?</p>
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => sendMessage("Förklara vad Bitcoin är")}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-full transition-colors"
                  >
                    Förklara vad Bitcoin är
                  </button>
                  <button 
                    onClick={() => sendMessage("Vilka kryptovalutor trendar just nu?")}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-full transition-colors"
                  >
                    Vilka kryptovalutor trendar just nu?
                  </button>
                  <button 
                    onClick={() => sendMessage("Vad bör jag tänka på innan jag investerar i krypto?")}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-full transition-colors"
                  >
                    Tips för kryptoinvesteringar
                  </button>
                </div>
              </div>
            ) : (
              messages.filter(m => m.role !== 'system').map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3/4 px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="bg-gray-500 h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="bg-gray-500 h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="bg-gray-500 h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-500 bg-opacity-20 text-red-300 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-gray-800 border-t border-gray-700 flex">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Skriv ett meddelande..."
              className="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`bg-blue-600 text-white px-4 rounded-r-lg flex items-center justify-center ${
                isLoading || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 