import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FaStar, FaCalendar, FaClock, FaGlobe, FaServer, FaPlay, 
  FaInfoCircle, FaUser, FaFilm, FaLanguage, FaDollarSign,
  FaTicketAlt, FaImdb, FaTheaterMasks, FaVideo, FaPhotoVideo,
  FaClosedCaptioning, FaGlobeAmericas, FaAward, FaTrophy,
  FaUserTie, FaMoneyBillWave, FaRegClock, FaRegCalendarAlt,
  FaRegStar, FaRegBookmark, FaRegHeart, FaRegEye, FaRegCommentAlt,
  FaRegFileAlt, FaRegImage, FaRegPlayCircle, FaRegTimesCircle,
  FaRegCheckCircle, FaRegBell, FaRegLightbulb
} from 'react-icons/fa';

function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [keywords, setKeywords] = useState(null);
  const [awards, setAwards] = useState(null);
  const [boxOffice, setBoxOffice] = useState(null);
  const [trivia, setTrivia] = useState(null);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [
          movieRes,
          creditsRes,
          videosRes,
          reviewsRes,
          similarRes,
          keywordsRes
        ] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/credits`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/reviews`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/similar`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${id}/keywords`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setMovie(movieRes.data);
        setCredits(creditsRes.data);
        setVideos(videosRes.data);
        setReviews(reviewsRes.data);
        setSimilar(similarRes.data);
        setKeywords(keywordsRes.data);

        // Simulate awards data
        if (movieRes.data.vote_average > 7.5) {
          setAwards([
            { name: "Academy Award", category: "Best Picture Nominee" },
            { name: "Golden Globe", category: "Best Motion Picture" }
          ]);
        }

        // Simulate box office data
        setBoxOffice({
          budget: movieRes.data.budget,
          revenue: movieRes.data.revenue,
          openingWeekend: Math.floor(movieRes.data.revenue * 0.3),
          worldwide: movieRes.data.revenue,
          domestic: Math.floor(movieRes.data.revenue * 0.4),
          international: Math.floor(movieRes.data.revenue * 0.6)
        });

        // Simulate trivia
        setTrivia([
          "The movie took over 6 months to film",
          "Over 1000 extras were used in crowd scenes",
          "The main actor performed their own stunts",
          "The film was shot in multiple countries"
        ]);

      } catch (error) {
        console.error('Error fetching movie data:', error);
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

  if (!movie || !credits) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-2xl">Loading movie details...</div>
      </div>
    );
  }

  const director = credits.crew.find(person => person.job === "Director");
  const writers = credits.crew.filter(person => 
    ["Screenplay", "Writer", "Story"].includes(person.job)
  );
  const producers = credits.crew.filter(person => 
    person.job === "Producer"
  ).slice(0, 3);

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

  const getProductionCountries = () => {
    return movie.production_countries.map(country => country.name).join(', ');
  };

  const getSpokenLanguages = () => {
    return movie.spoken_languages.map(lang => lang.english_name).join(', ');
  };

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
          <div className="w-[600px] ml-16 space-y-6">
            <div className="space-y-4">
              {movie.tagline && (
                <p className="text-gray-400 italic">"{movie.tagline}"</p>
              )}
              <h1 className="text-5xl font-bold text-white">{movie.title}</h1>
              {movie.title !== movie.original_title && (
                <p className="text-gray-400">Original Title: {movie.original_title}</p>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-2" />
                <span className="text-white font-bold">{movie.vote_average.toFixed(1)}/10</span>
              </div>
              <span className="text-white/70">{movie.release_date?.split('-')[0]}</span>
              <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">
                {movie.adult ? 'R' : 'PG-13'}
              </span>
              <span className="text-white/70">{formatRuntime(movie.runtime)}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map(genre => (
                <span 
                  key={genre.id}
                  className="px-3 py-1 bg-white/10 rounded-full text-white text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-lg text-white/90">{movie.overview}</p>

            {/* Streaming Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handlePlay('server1')}
                className="flex items-center justify-center px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-base font-semibold group w-full"
              >
                <FaPlay className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                Watch Now in 4K
              </button>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handlePlay('server2')}
                  className="flex items-center justify-center px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20 group"
                >
                  <FaServer className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Server 2
                </button>
                <button
                  onClick={() => handlePlay('server3')}
                  className="flex items-center justify-center px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20 group"
                >
                  <FaServer className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Server 3
                </button>
                <button
                  onClick={() => handlePlay('server4')}
                  className="flex items-center justify-center px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20 group"
                >
                  <FaServer className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Server 4
                </button>
                <button
                  onClick={() => handlePlay('server5')}
                  className="flex items-center justify-center px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20 group"
                >
                  <FaServer className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Server 5
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Movie Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        {/* Key Information */}
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
                <FaTheaterMasks className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Writers</p>
                  <p className="text-white">{writers.map(w => w.name).join(', ') || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaVideo className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Producers</p>
                  <p className="text-white">{producers.map(p => p.name).join(', ') || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaDollarSign className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Budget</p>
                  <p className="text-white">{formatCurrency(movie.budget)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaTicketAlt className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Revenue</p>
                  <p className="text-white">{formatCurrency(movie.revenue)}</p>
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

        {/* Box Office Information */}
        {boxOffice && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaMoneyBillWave className="text-green-500 mr-2" />
              Box Office Performance
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-gray-400">Opening Weekend</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(boxOffice.openingWeekend)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">Domestic Total</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(boxOffice.domestic)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">International</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(boxOffice.international)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">Worldwide Total</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(boxOffice.worldwide)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">Budget</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(boxOffice.budget)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">Profit</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(boxOffice.worldwide - boxOffice.budget)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Awards and Recognition */}
        {awards && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaTrophy className="text-yellow-500 mr-2" />
              Awards and Recognition
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {awards.map((award, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <FaAward className="text-yellow-500 w-6 h-6" />
                    <div>
                      <p className="text-white font-medium">{award.name}</p>
                      <p className="text-gray-400 text-sm">{award.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trivia Section */}
        {trivia && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaRegLightbulb className="text-blue-500 mr-2" />
              Movie Trivia
            </h2>
            <div className="grid gap-4">
              {trivia.map((fact, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <FaRegBookmark className="text-blue-500 w-5 h-5 mt-1" />
                    <p className="text-white">{fact}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Additional Information */}
        <motion.div 
          className="bg-white/5 rounded-xl p-6 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-gray-400">Status</p>
              <p className="text-white">{movie.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Release Date</p>
              <p className="text-white">{movie.release_date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Runtime</p>
              <p className="text-white">{formatRuntime(movie.runtime)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Original Language</p>
              <p className="text-white">{movie.original_language.toUpperCase()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Production Countries</p>
              <p className="text-white">{getProductionCountries()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Spoken Languages</p>
              <p className="text-white">{getSpokenLanguages()}</p>
            </div>
          </div>
        </motion.div>

        {/* Keywords and Tags */}
        {keywords && keywords.keywords.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {keywords.keywords.map(keyword => (
                <span 
                  key={keyword.id}
                  className="px-3 py-1 bg-white/10 rounded-full text-white text-sm"
                >
                  {keyword.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Similar Movies */}
        {similar && similar.results.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Similar Movies</h2>
            <div className="grid grid-cols-6 gap-4">
              {similar.results.slice(0, 6).map(movie => (
                <div key={movie.id} className="space-y-2">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-auto rounded-lg"
                  />
                  <p className="text-white font-medium text-sm">{movie.title}</p>
                  <p className="text-gray-400 text-xs">{movie.release_date?.split('-')[0]}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Movie;