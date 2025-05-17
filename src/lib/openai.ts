import { OpenAI } from 'openai';

// Skapa en OpenAI-instans med API-nyckeln från miljövariabler
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

// Funktion för att generera svar från chatboten
export async function generateChatbotResponse(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[], 
  cryptoContext: string = ""
) {
  try {
    // Om vi har cryptoContext, lägg till det i systemmeddelandet
    if (cryptoContext) {
      // Hitta det befintliga systemmeddelandet eller skapa ett nytt
      const systemMessageIndex = messages.findIndex(m => m.role === 'system');
      
      if (systemMessageIndex >= 0) {
        messages[systemMessageIndex].content += `\n\nAktuell kryptoinformation: ${cryptoContext}`;
      } else {
        messages.unshift({
          role: 'system',
          content: `Du är en hjälpsam assistent för en krypto blogg-plattform. Var vänlig och hjälpsam. Svara kort och koncist på svenska om möjligt.\n\nAktuell kryptoinformation: ${cryptoContext}`
        });
      }
    } else if (!messages.some(m => m.role === 'system')) {
      // Lägg till ett standardsystemmeddelande om inget finns
      messages.unshift({
        role: 'system',
        content: 'Du är en hjälpsam assistent för en krypto blogg-plattform. Var vänlig och hjälpsam. Svara kort och koncist på svenska om möjligt.'
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Fel vid generering av chatbot-svar:', error);
    return "Jag kunde inte generera ett svar just nu. Försök igen senare.";
  }
} 