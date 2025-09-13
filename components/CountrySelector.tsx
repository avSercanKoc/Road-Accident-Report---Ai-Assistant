import React, { useState } from 'react';
import type { AppConfig } from '../types';

interface Props {
  onSelect: (config: AppConfig) => void;
}

export const CountrySelector: React.FC<Props> = ({ onSelect }) => {
  const [locale, setLocale] = useState<'TR' | 'UK' | 'CA' | 'NY'>('UK');
  const [language, setLanguage] = useState<'TR' | 'EN'>('EN');

  const handleSubmit = () => {
    onSelect({ locale, language });
  };

  const jurisdictions = [
    { id: 'UK', name: 'United Kingdom' },
    { id: 'CA', name: 'California' },
    { id: 'NY', name: 'New York' },
    { id: 'TR', name: 'Turkey' },
  ] as const;

  const languages = [
    { id: 'EN', name: 'English' },
    { id: 'TR', name: 'Türkçe' },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-800/50 border border-zinc-700 rounded-2xl shadow-2xl animate-fade-in w-full max-w-md">
      <h2 className="text-2xl font-bold mb-2 text-zinc-100">Report Settings</h2>
      <p className="text-zinc-400 mb-8 text-center">Select the jurisdiction and language for your report.</p>
      
      <div className="w-full space-y-8">
        <div>
          <label className="block text-md font-semibold mb-3 text-zinc-300">Jurisdiction</label>
          <div className="grid grid-cols-2 gap-3">
            {jurisdictions.map((j) => (
              <button
                key={j.id}
                onClick={() => setLocale(j.id)}
                className={`p-4 rounded-lg text-center font-semibold transition-colors duration-200 ${locale === j.id ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'}`}
              >
                {j.name}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-md font-semibold mb-3 text-zinc-300">Language</label>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((l) => (
               <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`p-4 rounded-lg text-center font-semibold transition-colors duration-200 ${language === l.id ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'}`}
                >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
      >
        Continue
      </button>
    </div>
  );
};
