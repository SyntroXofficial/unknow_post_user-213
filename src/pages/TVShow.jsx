import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FaStar, FaCalendar, FaClock, FaServer, FaPlay, 
  FaUser, FaTv, FaLanguage, FaVideo, FaGlobeAmericas,
  FaAward, FaTrophy, FaUserTie, FaRegClock, FaRegCalendarAlt,
  FaRegStar, FaRegBookmark, FaRegHeart, FaRegEye,
  FaRegFileAlt, FaRegImage, FaRegPlayCircle,
  FaRegCheckCircle, FaRegBell, FaRegLightbulb, FaImdb
} from 'react-icons/fa';

function TVShow() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [credits, setCredits] = useState(null);
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
        const [showRes, creditsRes, seasonRes] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/credits`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason}`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setShow(showRes.data);
        setCredits(creditsRes.data);
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
    try {
      const seasonRes = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}`,
        { headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` } }
      );
      setSeasonDetails(seasonRes.data);
    } catch (error) {
      console.error('Error fetching season details:', error);
    }
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
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading show details...</p>
        </div>
      </div>
    );
  }

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
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="px-16 py-12 space-y-8 max-w-7xl mx-auto">
        {/* Show Info Section */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white tracking-tight">{show.name}</h1>
              {show.tagline && (
                <p className="text-2xl text-gray-400 italic">"{show.tagline}"</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaStar className="text-yellow-500 w-5 h-5 mr-2" />
                <span className="text-white font-bold">{show.vote_average.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaRegCalendarAlt className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-white">{show.first_air_date}</span>
              </div>
            </div>

            {/* Episode Selection */}
            <div className="space-y-4 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex gap-4">
                <select
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {seasonDetails?.episodes?.map((episode, index) => (
                    <option key={index + 1} value={index + 1}>
                      Episode {index + 1}: {episode.name}
                    </option>
                  ))}
                </select>
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

          {/* Show Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Show Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white">{show.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white">{show.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Episodes</span>
                  <span className="text-white">{show.number_of_episodes}</span>
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
                  <span className="text-white">When posted by third-party app</span>
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
                <h3 className="text-gray-400 font-medium">Created By</h3>
                <p className="text-white text-lg">
                  {show.created_by.map(creator => creator.name).join(', ') || 'N/A'}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Networks</h3>
                <div className="flex gap-4">
                  {show.networks.map(network => (
                    <div key={network.id} className="bg-white/10 rounded-lg p-2">
                      {network.logo_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                          alt={network.name}
                          className="h-8"
                        />
                      ) : (
                        <span className="text-white">{network.name}</span>
                      )}
                    </div>
                  ))}
                </div>
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

        {/* Show Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaTv className="text-purple-500" />
            Show Details
          </h2>

          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Status</h3>
                <p className="text-white text-lg">{show.status}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Type</h3>
                <p className="text-white text-lg">{show.type}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Seasons</h3>
                <p className="text-white text-lg">{show.number_of_seasons}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Episodes</h3>
                <p className="text-white text-lg">{show.number_of_episodes}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Original Country</h3>
                <p className="text-white text-lg">
                  {show.origin_country?.map(country => country).join(', ') || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Languages</h3>
                <p className="text-white text-lg">
                  {show.languages?.map(lang => lang.toUpperCase()).join(', ') || 'N/A'}
                </p>
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
              Show Trivia
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

export default TVShow;