"use client";
import Header from '../Header';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#181a20] text-white flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">FAQ</h1>
        <div className="bg-[#22242a] rounded-xl shadow p-6 sm:p-8 text-lg leading-relaxed space-y-6">
          <div>
            <h2 className="font-semibold text-xl mb-2">Vad är CryptoTalk?</h2>
            <p>CryptoTalk är en social plattform för att diskutera kryptovalutor, dela nyheter och få hjälp av andra entusiaster.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">Hur skapar jag ett inlägg?</h2>
            <p>Klicka på "Skapa inlägg" i menyn och fyll i formuläret. Du kan även tagga kryptovalutor i dina inlägg.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">Kostar det något att använda CryptoTalk?</h2>
            <p>Nej, plattformen är helt gratis att använda för alla.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">Hur får jag de senaste kryptonyheterna?</h2>
            <p>Besök sidan "Crypto News" i menyn för att se de senaste nyheterna från hela kryptovärlden.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 