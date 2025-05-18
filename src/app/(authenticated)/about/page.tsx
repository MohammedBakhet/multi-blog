"use client";
import Header from '../Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Om oss</h1>
        <div className="bg-[#22242a] rounded-xl shadow p-6 sm:p-8 text-lg leading-relaxed">
          <p>
            Välkommen till CryptoTalk! Vi är en community-driven plattform för alla som är intresserade av kryptovalutor, blockchain och framtidens finans. Här kan du diskutera, dela nyheter, ställa frågor och hålla dig uppdaterad om det senaste inom krypto-världen.
          </p>
          <p className="mt-4">
            Vårt mål är att göra krypto mer tillgängligt, transparent och roligt för alla – oavsett om du är nybörjare eller expert. Tveka inte att kontakta oss om du har frågor eller vill bidra till plattformen!
          </p>
        </div>
      </main>
    </div>
  );
} 