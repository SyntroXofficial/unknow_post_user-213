import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}`,
          {
            headers: {
              'Authorization': `Bearer ${TMDB_TOKEN}`
            }
          }
        );
        setResults(response.data.results.filter(item => item.media_type !== 'person'));
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
      setLoading(false);
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] pt-[88px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-[88px] px-16">
      <h1 className="text-4xl font-bold text-white mb-8 animate-fade-in">
        Search Results for "{query}"
      </h1>
      
      <div className="grid grid-cols-5 gap-6">
        {results.map((item) => (
          <Link 
            key={item.id}
            to={`/${item.media_type}/${item.id}`}
            className="transform transition-all duration-300 hover:scale-105 hover:z-10 animate-fade-up"
          >
            <div className="relative group rounded-lg overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold">{item.title || item.name}</h3>
                <div className="flex items-center mt-2">
                  <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                  <span className="text-white">{item.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {results.length === 0 && (
        <div className="text-center text-gray-400 mt-12 animate-fade-in">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}

export default Search;