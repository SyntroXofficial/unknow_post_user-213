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
    const searchContent = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
          params: {
            query,
            include_adult: false,
            language: 'en-US',
            page: 1
          },
          headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
        });

        setResults(response.data.results.filter(item => 
          item.media_type !== 'person' && item.poster_path
        ));
      } catch (error) {
        console.error('Error searching content:', error);
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 px-16">
      <h1 className="text-4xl font-bold text-white mb-8">
        Search Results for "{query}"
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-2xl font-semibold">No results found</p>
          <p className="mt-2">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {results.map((item) => (
            <Link 
              key={item.id}
              to={`/${item.media_type}/${item.id}`}
              className="transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative group">
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full rounded-md shadow-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-lg">
                      {item.title || item.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                        <span className="text-white">
                          {item.vote_average?.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-white/70">•</span>
                      <span className="text-white/70">
                        {(item.release_date || item.first_air_date)?.split('-')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;