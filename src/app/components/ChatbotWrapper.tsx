'use client';

import dynamic from 'next/dynamic';

// Ladda chatboten dynamiskt för att undvika problem med server-side rendering
const ChatbotWidget = dynamic(() => import('./ChatbotWidget'), {
  ssr: false,
  loading: () => null
});

export default function ChatbotWrapper() {
  return <ChatbotWidget />;
} 