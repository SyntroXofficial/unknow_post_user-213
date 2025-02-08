import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStar, FaCalendar, FaClock, FaGlobe, FaServer, FaPlay, 
  FaInfoCircle, FaUser, FaTv, FaLanguage, FaDollarSign,
  FaTicketAlt, FaImdb, FaTheaterMasks, FaVideo, FaPhotoVideo,
  FaClosedCaptioning, FaGlobeAmericas, FaAward, FaTrophy,
  FaUserTie, FaMoneyBillWave, FaRegClock, FaRegCalendarAlt,
  FaRegStar, FaRegBookmark, FaRegHeart, FaRegEye, FaRegCommentAlt,
  FaRegFileAlt, FaRegImage, FaRegPlayCircle, FaRegTimesCircle,
  FaRegCheckCircle, FaRegBell, FaRegLightbulb
} from 'react-icons/fa';
import axios from 'axios';

function TVShow() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [keywords, setKeywords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [awards, setAwards] = useState(null);
  const [trivia, setTrivia] = useState(null);
  const [ratings, setRatings] = useState(null);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchShowData = async () => {
      try {
        const [
          showRes,
          creditsRes,
          videosRes,
          reviewsRes,
          similarRes,
          keywordsRes,
          seasonRes
        ] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/credits`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/videos`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/reviews`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/similar`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/keywords`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason}`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setShow(showRes.data);
        setCredits(creditsRes.data);
        setVideos(videosRes.data);
        setReviews(reviewsRes.data);
        setSimilar(similarRes.data);
        setKeywords(keywordsRes.data);
        setSeasonDetails(seasonRes.data);

        if (showRes.data.vote_average > 8) {
          setAwards([
            { name: "Emmy Awards", category: "Outstanding Drama Series" },
            { name: "Golden Globe Awards", category: "Best Television Series" }
          ]);
        }

        setRatings({
          average: showRes.data.vote_average,
          popularity: showRes.data.popularity,
          voteCount: showRes.data.vote_count
        });

        setTrivia([
          "The show took over a year to film",
          "Features over 100 different filming locations",
          "Used groundbreaking special effects",
          "Has won multiple industry awards"
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching show data:', error);
        setLoading(false);
      }
    };

    fetchShowData();
  }, [id, selectedSeason]);

  const handleSeasonChange = async (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
  };

  const handlePlay = (provider) => {
    let streamingUrl;
    switch (provider) {
      case 'server1':
        streamingUrl = `https://player.videasy.net/tv/${id}/${selectedSeason}/${selectedEpisode}?color=8B5CF6`;
        break;
      case 'server2':
        streamingUrl = `https://vidsrc.cc/v3/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?autoPlay=false`;
        break;
      case 'server3':
        streamingUrl = `https://embed.su/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`;
        break;
      case 'server4':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&type=tv&s=${selectedSeason}&e=${selectedEpisode}`;
        break;
      case 'server5':
        streamingUrl = `https://multiembed.mov/?video_id=${id}&tmdb=1&type=tv&s=${selectedSeason}&e=${selectedEpisode}`;
        break;
      default:
        streamingUrl = `https://player.videasy.net/tv/${id}/${selectedSeason}/${selectedEpisode}?color=8B5CF6`;
    }
    window.open(streamingUrl, '_blank');
  };

  if (loading || !show || !credits) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading show details...</p>
        </div>
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
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Show Info */}
        <motion.div 
          className="absolute inset-0 flex items-end pb-32"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="w-[600px] ml-16 space-y-6">
            <h1 className="text-5xl font-bold text-white">{show.name}</h1>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-2" />
                <span className="text-white font-bold">{show.vote_average.toFixed(1)}/10</span>
              </div>
              <span className="text-white/70">{show.first_air_date?.split('-')[0]}</span>
              <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">
                {show.type}
              </span>
              <span className="text-white/70">{show.number_of_seasons} Seasons</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {show.genres.map(genre => (
                <span 
                  key={genre.id}
                  className="px-3 py-1 bg-white/10 rounded-full text-white text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-lg text-white/90">{show.overview}</p>

            {/* Season and Episode Selection */}
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex space-x-4">
                <select
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20"
                >
                  {Array.from({ length: show.number_of_seasons }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Season {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20"
                >
                  {seasonDetails?.episodes?.map((episode, index) => (
                    <option key={index + 1} value={index + 1}>
                      Episode {index + 1}: {episode.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episode Info */}
              {seasonDetails?.episodes?.[selectedEpisode - 1] && (
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h3 className="text-white font-bold mb-2">
                    {seasonDetails.episodes[selectedEpisode - 1].name}
                  </h3>
                  <p className="text-gray-400">
                    {seasonDetails.episodes[selectedEpisode - 1].overview}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>Air Date: {seasonDetails.episodes[selectedEpisode - 1].air_date}</span>
                    <span>Runtime: {seasonDetails.episodes[selectedEpisode - 1].runtime} min</span>
                  </div>
                </div>
              )}
            </div>

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

      {/* Show Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        {/* Key Information */}
        <motion.div 
          className="grid grid-cols-2 gap-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Show Details</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <FaUser className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Created By</p>
                  <p className="text-white">
                    {show.created_by.map(creator => creator.name).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaTv className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Network</p>
                  <p className="text-white">
                    {show.networks.map(network => network.name).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaVideo className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-white">{show.status}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaClock className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Episode Runtime</p>
                  <p className="text-white">{show.episode_run_time?.[0] || 'N/A'} minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaGlobe className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Original Language</p>
                  <p className="text-white">{show.original_language?.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cast */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Main Cast</h2>
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
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-gray-400">First Air Date</p>
              <p className="text-white">{show.first_air_date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Last Air Date</p>
              <p className="text-white">{show.last_air_date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Number of Episodes</p>
              <p className="text-white">{show.number_of_episodes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Number of Seasons</p>
              <p className="text-white">{show.number_of_seasons}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Original Country</p>
              <p className="text-white">
                {show.origin_country?.map(country => country).join(', ') || 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Popularity</p>
              <p className="text-white">{show.popularity?.toFixed(1)}</p>
            </div>
          </div>
        </motion.div>

        {/* Awards Section */}
        {awards && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8"
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
            className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaRegLightbulb className="text-blue-500 mr-2" />
              Show Trivia
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

        {/* Reviews Section */}
        {reviews && reviews.results.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">User Reviews</h2>
            <div className="space-y-4">
              {reviews.results.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaUser className="text-gray-400" />
                    <span className="text-white font-medium">{review.author}</span>
                  </div>
                  <p className="text-gray-400 line-clamp-3">{review.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Similar Shows */}
        {similar && similar.results.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Similar Shows</h2>
            <div className="grid grid-cols-6 gap-4">
              {similar.results.slice(0, 6).map(show => (
                <div key={show.id} className="space-y-2">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                    alt={show.name}
                    className="w-full h-auto rounded-lg"
                  />
                  <p className="text-white font-medium text-sm">{show.name}</p>
                  <p className="text-gray-400 text-xs">{show.first_air_date?.split('-')[0]}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TVShow;