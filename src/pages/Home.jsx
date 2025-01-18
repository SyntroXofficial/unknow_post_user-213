import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';

function Home() {
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/trending/all/day', {
          headers: {
            'Authorization': `Bearer ${TMDB_TOKEN}`
          }
        });
        setTrending(response.data.results);
        setFeatured(response.data.results[0]);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    if (trending.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % trending.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [trending]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Featured Content Hero Section */}
      {trending[currentFeaturedIndex] && (
        <div className="relative h-[100vh] w-full">
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
            <img
              src={`https://image.tmdb.org/t/p/original${trending[currentFeaturedIndex].backdrop_path}`}
              alt={trending[currentFeaturedIndex].title || trending[currentFeaturedIndex].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
          </div>
          
          <div className="absolute bottom-32 left-0 px-24 space-y-4 w-[50%]">
            <div className="flex items-center space-x-6 text-xl">
              <span className="text-purple-500 font-bold tracking-wider">#1 Trending Now</span>
              <div className="flex items-center bg-purple-500/20 px-4 py-2 rounded-full">
                <FaStar className="text-yellow-500 w-4 h-4" />
                <span className="text-white ml-2 font-semibold">98% Match</span>
              </div>
            </div>
            <h1 className="text-7xl font-black text-white tracking-tight leading-none drop-shadow-lg">
              {trending[currentFeaturedIndex].title || trending[currentFeaturedIndex].name}
            </h1>
            <p className="text-xl text-white line-clamp-3 font-medium drop-shadow-lg max-w-4xl">
              {trending[currentFeaturedIndex].overview}
            </p>
            <div className="flex space-x-4 mt-8">
              <Link 
                to={`/${trending[currentFeaturedIndex].media_type}/${trending[currentFeaturedIndex].id}`}
                className="flex items-center px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 font-bold text-xl"
              >
                <FaPlay className="mr-2 w-6 h-6" /> Play
              </Link>
              <button className="flex items-center px-8 py-3 bg-gray-500/40 text-white rounded-lg hover:bg-gray-500/60 transition-all duration-300 transform hover:scale-105 font-bold text-xl backdrop-blur-sm">
                <FaInfoCircle className="mr-2 w-6 h-6" /> More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 px-16 pb-16 space-y-12 bg-[#0a0a0a]">
        <section className="animate-fade-up">
          <h2 className="text-3xl font-bold text-white mb-6">Continue Watching</h2>
          <div className="grid grid-cols-6 gap-4">
            {trending.slice(0, 6).map((item) => (
              <Link 
                key={item.id} 
                to={`/${item.media_type}/${item.id}`}
                className="transform transition-all duration-300 hover:scale-110 hover:z-20"
              >
                <div className="relative group">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full rounded-md shadow-lg"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                      <p className="text-white font-bold text-lg">{item.title || item.name}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-purple-500 font-bold">98% Match</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;