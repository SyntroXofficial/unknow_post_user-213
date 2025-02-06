import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaStar, FaCalendar, FaClock, FaGlobe, FaPlay, FaInfoCircle, FaUser, FaFilm, FaLanguage, FaServer } from 'react-icons/fa';

function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  const serverInfo = {
    server1: { name: 'Primary Server', quality: '1080p', url: 'https://multiembed.mov' },
    server2: { name: 'Backup Server', quality: '1080p', url: 'https://multiembed.mov/directstream.php' },
    server3: { name: 'Alternative Server', quality: '1080p', url: 'https://embed.su/embed' },
    server4: { name: 'Premium Server', quality: '1080p/4K', url: 'https://vidsrc.cc/v3/embed' },
    server5: { name: '4K UHD Server', quality: '4K UHD', url: 'https://player.videasy.net/4k-uhd' }
  };

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

  const openServer = (serverUrl) => {
    window.open(`${serverUrl}/movie/${id}`, '_blank');
  };

  if (!movie || !credits) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-2xl">Loading movie details...</div>
      </div>
    );
  }

  const matchScore = Math.round(movie.vote_average * 10);
  const director = credits.crew.find(person => person.job === "Director");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[100vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Movie Info */}
        <motion.div 
          className="absolute inset-0 flex items-end pb-32"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="w-[500px] ml-16 space-y-6">
            <h1 className="text-5xl font-bold text-white">{movie.title}</h1>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-2" />
                <span className="text-white font-bold">{matchScore}% Match</span>
              </div>
              <span className="text-white/70">{movie.release_date?.split('-')[0]}</span>
              <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">
                {movie.adult ? 'R' : 'PG-13'}
              </span>
              <span className="text-white/70">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </div>

            <p className="text-lg text-white/90">{movie.overview}</p>

            {/* Server Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(serverInfo).map(([key, server]) => (
                <button
                  key={key}
                  onClick={() => openServer(server.url)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 group"
                >
                  <FaServer className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-left">
                    <div className="font-semibold">{server.name}</div>
                    <div className="text-xs text-white/70">{server.quality}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Movie Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        {/* Movie Information */}
        <motion.div 
          className="grid grid-cols-2 gap-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Movie Details</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <FaUser className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Director</p>
                  <p className="text-white">{director?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaFilm className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Runtime</p>
                  <p className="text-white">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaLanguage className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Language</p>
                  <p className="text-white">{movie.original_language.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaCalendar className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Release Date</p>
                  <p className="text-white">{movie.release_date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cast Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Cast</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
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
                      <p className="text-gray-400 text-sm">{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div 
          className="bg-white/5 rounded-xl p-6 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8  }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-gray-400">Budget</p>
              <p className="text-white">${movie.budget?.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Revenue</p>
              <p className="text-white">${movie.revenue?.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Status</p>
              <p className="text-white">{movie.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Original Title</p>
              <p className="text-white">{movie.original_title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Production Countries</p>
              <p className="text-white">{movie.production_countries?.map(country => country.name).join(', ')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Spoken Languages</p>
              <p className="text-white">{movie.spoken_languages?.map(lang => lang.english_name).join(', ')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Movie;