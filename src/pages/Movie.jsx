import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaCalendar, FaClock, FaGlobe, FaServer } from 'react-icons/fa';

function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieRes, creditsRes] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/credits`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setMovie(movieRes.data);
        setCredits(creditsRes.data);
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    fetchMovieData();
  }, [id]);

  const handlePlay = (provider) => {
    let streamingUrl;
    switch (provider) {
      case 'viper':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
        break;
      case 'superembed':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&server=2`;
        break;
      default:
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
    }
    window.open(streamingUrl, '_blank');
  };

  if (!movie || !credits) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );

  const matchScore = Math.round(movie.vote_average * 10);
  const director = credits.crew.find(person => person.job === "Director");

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <div className="relative">
        {/* Background Image */}
        <div className="relative h-[80vh] animate-fade-in">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Movie Info */}
        <div className="absolute top-1/2 -translate-y-1/2 left-16 w-1/2 space-y-6 animate-fade-up">
          <h1 className="text-6xl font-bold text-white">{movie.title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-purple-500 font-bold">{matchScore}% Match</span>
            <span className="text-white/70">{movie.release_date?.split('-')[0]}</span>
            <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">
              {movie.adult ? 'R' : 'PG-13'}
            </span>
            <span className="text-white/70">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            <span className="flex items-center">
              <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>
          <p className="text-lg text-white/90 line-clamp-3">{movie.overview}</p>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => handlePlay('viper')}
              className="flex items-center px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 font-semibold text-xl"
            >
              <FaServer className="mr-2" /> Server 1
            </button>
            <button
              onClick={() => handlePlay('superembed')}
              className="flex items-center px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 font-semibold text-xl"
            >
              <FaServer className="mr-2" /> Server 2
            </button>
          </div>
        </div>
      </div>

      {/* Additional Movie Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12 animate-fade-up">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">About {movie.title}</h2>
            <div className="space-y-4 text-white/70">
              <p><span className="text-white">Director:</span> {director?.name}</p>
              <p><span className="text-white">Cast:</span> {credits.cast.slice(0, 5).map(actor => actor.name).join(', ')}</p>
              <p><span className="text-white">Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <FaCalendar className="text-purple-500" />
                  <span>{movie.release_date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-purple-500" />
                  <span>{movie.runtime} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaGlobe className="text-purple-500" />
                  <span>{movie.original_language.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Cast</h2>
            <div className="grid grid-cols-2 gap-4">
              {credits.cast.slice(0, 6).map(actor => (
                <div key={actor.id} className="flex items-center space-x-3">
                  <img
                    src={actor.profile_path 
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : 'https://via.placeholder.com/185x278?text=No+Image'
                    }
                    alt={actor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{actor.name}</p>
                    <p className="text-white/70 text-sm">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Movie;