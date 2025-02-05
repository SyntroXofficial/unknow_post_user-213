import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaStar, FaCalendar, FaClock, FaGlobe, FaServer, FaPlay, FaInfoCircle, FaUser, FaTv, FaLanguage } from 'react-icons/fa';

function TVShow() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [credits, setCredits] = useState(null);
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
          axios.get(`https://api.themoviedb.org/3/tv/${id}/season/1`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setShow(showRes.data);
        setCredits(creditsRes.data);
        setSeasonDetails(seasonRes.data);
      } catch (error) {
        console.error('Error fetching TV show data:', error);
      }
    };

    fetchShowData();
  }, [id]);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      try {
        const seasonResponse = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}/season/${season}`,
          { headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` } }
        );
        setSeasonDetails(seasonResponse.data);
        setEpisode(1);
      } catch (error) {
        console.error('Error fetching season details:', error);
      }
    };

    if (show) {
      fetchSeasonDetails();
    }
  }, [season, id]);

  const handlePlay = (provider) => {
    let streamingUrl;
    switch (provider) {
      case 'server1':
        streamingUrl = `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        break;
      case 'server2':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        break;
      case 'server3':
        streamingUrl = `https://embed.su/embed/tv/${id}/${season}/${episode}`;
        break;
      case 'server4':
        streamingUrl = `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
        break;
      case 'server5':
        streamingUrl = `https://player.videasy.net/tv/${id}/${season}/${episode}?color=8B5CF6`;
        break;
      default:
        streamingUrl = `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    }
    window.open(streamingUrl, '_blank');
  };

  if (!show || !seasonDetails || !credits) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-2xl">Loading show details...</div>
      </div>
    );
  }

  const matchScore = Math.round(show.vote_average * 10);
  const creators = show.created_by || [];

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
          <div className="w-[500px] ml-16 space-y-6">
            <h1 className="text-5xl font-bold text-white">{show.name}</h1>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-2" />
                <span className="text-white font-bold">{matchScore}% Match</span>
              </div>
              <span className="text-white/70">{show.first_air_date?.split('-')[0]}</span>
              <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">TV-MA</span>
              <span className="text-white/70">{show.number_of_seasons} Seasons</span>
            </div>

            <p className="text-lg text-white/90">{show.overview}</p>

            {/* Episode Selection */}
            <div className="flex flex-col space-y-2">
              <div className="flex gap-3">
                <select 
                  value={season}
                  onChange={(e) => setSeason(Number(e.target.value))}
                  className="bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/20 focus:border-white focus:outline-none appearance-none cursor-pointer flex-1"
                >
                  {Array.from({ length: show.number_of_seasons }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Season {i + 1}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={episode}
                  onChange={(e) => setEpisode(Number(e.target.value))}
                  className="bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/20 focus:border-white focus:outline-none appearance-none cursor-pointer flex-1"
                >
                  {Array.from({ length: seasonDetails.episodes?.length || 0 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Episode {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Streaming Buttons */}
              <button
                onClick={() => handlePlay('server1')}
                className="flex items-center justify-center px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-base font-semibold group w-full"
              >
                <FaPlay className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                Watch Now
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
                  Server 5 4K
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Show Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        {/* Show Information */}
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
                  <p className="text-white">{creators.map(c => c.name).join(', ') || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaTv className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Seasons</p>
                  <p className="text-white">{show.number_of_seasons}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaLanguage className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Language</p>
                  <p className="text-white">{show.original_language.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaCalendar className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">First Air Date</p>
                  <p className="text-white">{show.first_air_date}</p>
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

        {/* Season Details */}
        <motion.div 
          className="bg-white/5 rounded-xl p-6 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Season {season} Episodes</h2>
          <div className="grid grid-cols-2 gap-6">
            {seasonDetails.episodes?.slice(0, 4).map(episode => (
              <div key={episode.id} className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-white/30 transition-all group">
                <div className="flex space-x-4">
                  <img
                    src={episode.still_path
                      ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                      : 'https://via.placeholder.com/300x170?text=No+Image'
                    }
                    alt={episode.name}
                    className="w-40 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">Episode {episode.episode_number}: {episode.name}</p>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{episode.overview}</p>
                    <div className="flex items-center text-sm">
                      <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                      <span className="text-gray-400">{episode.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div 
          className="bg-white/5 rounded-xl p-6 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.9, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-gray-400">Status</p>
              <p className="text-white">{show.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Type</p>
              <p className="text-white">{show.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Networks</p>
              <p className="text-white">{show.networks?.map(network => network.name).join(', ')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Original Name</p>
              <p className="text-white">{show.original_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Production Countries</p>
              <p className="text-white">{show.production_countries?.map(country => country.name).join(', ')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Spoken Languages</p>
              <p className="text-white">{show.spoken_languages?.map(lang => lang.english_name).join(', ')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TVShow;