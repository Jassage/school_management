import React, { useState, useEffect, useRef } from 'react';
import { Search, User, GraduationCap, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'student' | 'teacher' | 'user';
  title: string;
  subtitle: string;
  link: string;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      // Simuler une recherche
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'student',
          title: 'Jean Dupont',
          subtitle: 'Licence 2 - Informatique',
          link: '/dashboard/students',
        },
        {
          id: '2',
          type: 'teacher',
          title: 'Marie Martin',
          subtitle: 'Département Mathématiques',
          link: '/dashboard/teachers',
        },
        {
          id: '3',
          type: 'user',
          title: 'Admin User',
          subtitle: 'Administrateur',
          link: '/dashboard/users',
        },
      ].filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.subtitle.toLowerCase().includes(query.toLowerCase())
      );

      setResults(mockResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'student':
        return <GraduationCap className="w-5 h-5" />;
      case 'teacher':
        return <BookOpen className="w-5 h-5" />;
      case 'user':
        return <User className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                className="w-full px-4 py-3 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left"
                onClick={() => {
                  navigate(result.link);
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  {getIcon(result.type)}
                </div>
                <div>
                  <div className="font-medium">{result.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {result.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}