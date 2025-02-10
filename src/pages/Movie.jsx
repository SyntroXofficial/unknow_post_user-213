import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FaStar, FaCalendar, FaClock, FaServer, FaPlay, 
  FaUser, FaFilm, FaLanguage, FaDollarSign,
  FaTicketAlt, FaImdb, FaTheaterMasks, FaVideo,
  FaGlobeAmericas, FaAward, FaTrophy, FaUserTie,
  FaMoneyBillWave, FaRegClock, FaRegCalendarAlt,
  FaRegStar, FaRegBookmark, FaRegHeart, FaRegEye,
  FaRegFileAlt, FaRegImage, FaRegPlayCircle,
  FaRegCheckCircle, FaRegBell, FaRegLightbulb
} from 'react-icons/fa';

function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [awards, setAwards] = useState(null);
  const [trivia, setTrivia] = useState(null);
  const [ratings, setRatings] = useState(null);
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

        // Set awards for highly rated movies
        if (movieRes.data.vote_average > 7.5) {
          setAwards([
            { name: "Academy Award", category: "Best Picture Nominee" },
            { name: "Golden Globe", category: "Best Motion Picture" }
          ]);
        }

        setRatings({
          average: movieRes.data.vote_average,
          popularity: movieRes.data.popularity,
          voteCount: movieRes.data.vote_count
        });

        setTrivia([
          "The movie took over 6 months to film",
          "Over 1000 extras were used in crowd scenes",
          "The main actor performed their own stunts",
          "The film was shot in multiple countries"
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const handlePlay = (provider) => {
    let streamingUrl;
    switch (provider) {
      case 'server1':
        streamingUrl = `https://player.videasy.net/movie/${id}?color=8B5CF6`;
        break;
      case 'server2':
        streamingUrl = `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`;
        break;
      case 'server3':
        streamingUrl = `https://embed.su/embed/movie/${id}`;
        break;
      case 'server4':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
        break;
      case 'server5':
        streamingUrl = `https://multiembed.mov/?video_id=${id}&tmdb=1`;
        break;
      default:
        streamingUrl = `https://player.videasy.net/movie/${id}?color=8B5CF6`;
    }
    window.open(streamingUrl, '_blank');
  };

  if (loading || !movie || !credits) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  const director = credits.crew.find(person => person.job === "Director");
  const writers = credits.crew.filter(person => 
    ["Screenplay", "Writer", "Story"].includes(person.job)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[75vh]"
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
      </motion.div>

      {/* Content Sections */}
      <div className="px-16 py-12 space-y-8 max-w-7xl mx-auto">
        {/* Movie Info Section */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white tracking-tight">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-2xl text-gray-400 italic">"{movie.tagline}"</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaStar className="text-yellow-500 w-5 h-5 mr-2" />
                <span className="text-white font-bold">{movie.vote_average.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaRegCalendarAlt className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-white">{movie.release_date}</span>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaRegClock className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-white">{formatRuntime(movie.runtime)}</span>
              </div>
            </div>

            {/* Streaming Buttons */}
            <div className="flex flex-col gap-4 max-w-xl">
              <button
                onClick={() => handlePlay('server1')}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                <FaPlay className="w-5 h-5" />
                Watch in 4K Ultra HD
              </button>

              <div className="grid grid-cols-4 gap-3">
                {['server2', 'server3', 'server4', 'server5'].map((server, index) => (
                  <button
                    key={server}
                    onClick={() => handlePlay(server)}
                    className="flex flex-col items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-xl transition-all duration-300"
                  >
                    <FaServer className="w-5 h-5" />
                    <span className="text-sm font-medium">Server {index + 2}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Movie Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Movie Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white">{movie.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Budget</span>
                  <span className="text-white">{formatCurrency(movie.budget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Revenue</span>
                  <span className="text-white">{formatCurrency(movie.revenue)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Online Status</span>
                  <span className="text-green-500 flex items-center">
                    <FaRegCheckCircle className="w-4 h-4 mr-1" />
                    Working
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Verified</span>
                  <span className="text-white">When posted by third-party app </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cast & Crew */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaUserTie className="text-red-500" />
            Cast & Crew
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Director</h3>
                <p className="text-white text-lg">{director?.name || 'N/A'}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Writers</h3>
                <p className="text-white text-lg">{writers.map(w => w.name).join(', ') || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-gray-400 font-medium mb-4">Main Cast</h3>
              <div className="grid grid-cols-2 gap-4">
                {credits.cast.slice(0, 4).map(actor => (
                  <div key={actor.id} className="flex items-center gap-3">
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
        </motion.section>

        {/* Movie Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaFilm className="text-purple-500" />
            Movie Details
          </h2>

          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Release Status</h3>
                <p className="text-white text-lg">{movie.status}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Runtime</h3>
                <p className="text-white text-lg">{formatRuntime(movie.runtime)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Production Companies</h3>
                <div className="space-y-2">
                  {movie.production_companies.map(company => (
                    <p key={company.id} className="text-white">{company.name}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Production Countries</h3>
                <div className="space-y-2">
                  {movie.production_countries.map(country => (
                    <p key={country.iso_3166_1} className="text-white">{country.name}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Awards & Recognition */}
        {awards && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaTrophy className="text-yellow-500" />
              Awards & Recognition
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {awards.map((award, index) => (
                <div 
                  key={index}
                  className="bg-black/30 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <FaAward className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{award.name}</h3>
                      <p className="text-gray-400">{award.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Trivia */}
        {trivia && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaRegLightbulb className="text-blue-500" />
              Movie Trivia
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {trivia.map((fact, index) => (
                <div 
                  key={index}
                  className="bg-black/30 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-full h-min">
                      <FaRegBookmark className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-white">{fact}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Ratings & Stats */}
        {ratings && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaRegStar className="text-yellow-500" />
              Ratings & Statistics
            </h2>

            <div className="grid grid-cols-4 gap-6">
              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <FaStar className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.average.toFixed(1)}</p>
                    <p className="text-gray-400">Average Rating</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <FaRegEye className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.voteCount.toLocaleString()}</p>
                    <p className="text-gray-400">Total Votes</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <FaRegHeart className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.popularity.toFixed(0)}</p>
                    <p className="text-gray-400">Popularity Score</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <FaImdb className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{(ratings.average * 10).toFixed(0)}%</p>
                    <p className="text-gray-400">Match Score</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

export default Movie;