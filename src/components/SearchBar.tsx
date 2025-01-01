'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (location: string) => void;
  onMagnitudeFilter: (magnitude: number) => void;
}

export default function SearchBar({ onSearch, onMagnitudeFilter }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [magnitude, setMagnitude] = useState(3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleMagnitudeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setMagnitude(value);
    onMagnitudeFilter(value);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by location..."
            className="w-full px-4 py-2 text-black rounded-lg border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
        
        <div className="w-full md:w-48">
          <select
            value={magnitude}
            onChange={handleMagnitudeChange}
            className="w-full px-4 py-2 text-black rounded-lg border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value={3}>All Magnitudes</option>
            <option value={4}>M4.0+</option>
            <option value={5}>M5.0+</option>
            <option value={6}>M6.0+</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}
