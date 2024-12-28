
// src/components/common/SearchBar.js
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsExpanded(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative">
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="flex items-center bg-gray-100 rounded-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="px-4 py-2 bg-transparent focus:outline-none w-64"
              autoFocus
            />
            <button type="submit" className="p-2">
              <Search className="h-5 w-5 text-gray-700" />
            </button>
            <button 
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setSearchQuery('');
              }}
              className="p-2"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsExpanded(true)} className="focus:outline-none">
          <Search className="h-5 w-5 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;