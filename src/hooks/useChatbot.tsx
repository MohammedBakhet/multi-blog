import { useState, useCallback } from 'react';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Skicka ett meddelande till chatboten
  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Lägg till användarens meddelande i konversationen
      const userMessage: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Skicka meddelanden till API:et
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!response.ok) {
        throw new Error('Något gick fel vid kommunikation med chatboten.');
      }
      
      const data = await response.json();
      
      // Lägg till assistentens svar i konversationen
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };
      setMessages([...updatedMessages, assistantMessage]);
      
      return assistantMessage.content;
    } catch (err) {
      console.error('Fel vid kommunikation med chatbot:', err);
      setError(err instanceof Error ? err.message : 'Ett okänt fel inträffade');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Rensa konversationen
  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
  };
} 