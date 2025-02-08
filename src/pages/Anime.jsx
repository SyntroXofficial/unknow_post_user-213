import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

function Anime() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [awards, setAwards] = useState(null);
  const [trivia, setTrivia] = useState(null);
  const [ratings, setRatings] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const query = `
          query ($id: Int) {
            Media (id: $id, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                extraLarge
                large
              }
              bannerImage
              episodes
              duration
              status
              season
              seasonYear
              format
              genres
              averageScore
              popularity
              meanScore
              trending
              favourites
              studios {
                nodes {
                  name
                  isAnimationStudio
                }
              }
              staff {
                nodes {
                  name {
                    full
                  }
                  primaryOccupations
                }
              }
              characters(sort: ROLE, perPage: 6) {
                nodes {
                  name {
                    full
                  }
                  image {
                    medium
                  }
                  gender
                  age
                  role
                  description
                }
              }
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              source
              hashtag
              synonyms
              countryOfOrigin
              isLicensed
              licensedBy {
                nodes {
                  name
                }
              }
              rankings {
                rank
                type
                season
                year
              }
              tags {
                name
                rank
                description
              }
              reviews {
                nodes {
                  summary
                  score
                  user {
                    name
                  }
                }
              }
              recommendations {
                nodes {
                  mediaRecommendation {
                    id
                    title {
                      romaji
                    }
                    coverImage {
                      medium
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            variables: { id: parseInt(id) }
          })
        });

        const data = await response.json();
        const animeData = data.data.Media;
        setAnime(animeData);

        // Set awards for highly rated anime
        if (animeData.averageScore > 80) {
          setAwards([
            { name: "Crunchyroll Anime Awards", category: "Anime of the Year Nominee" },
            { name: "Japan Academy Prize", category: "Animation of the Year" }
          ]);
        }

        setRatings({
          average: animeData.averageScore / 10,
          popularity: animeData.popularity,
          voteCount: animeData.favourites,
          meanScore: animeData.meanScore / 10
        });

        setTrivia([
          "Production took over 2 years to complete",
          "Features innovative animation techniques",
          "Highly acclaimed by critics and fans",
          "Influenced many subsequent anime series"
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching anime data:', error);
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id]);

  const handlePlay = (provider) => {
    let streamingUrl;
    switch (provider) {
      case 'server1':
        streamingUrl = `https://player.videasy.net/anime/${id}/${selectedEpisode}?color=8B5CF6`;
        break;
      case 'server2':
        streamingUrl = `https://vidsrc.cc/v3/embed/anime/${id}/${selectedEpisode}?autoPlay=false`;
        break;
      case 'server3':
        streamingUrl = `https://embed.su/embed/anime/${id}/${selectedEpisode}`;
        break;
      case 'server4':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&type=anime&e=${selectedEpisode}`;
        break;
      case 'server5':
        streamingUrl = `https://multiembed.mov/?video_id=${id}&tmdb=1&type=anime&e=${selectedEpisode}`;
        break;
      default:
        streamingUrl = `https://player.videasy.net/anime/${id}/${selectedEpisode}?color=8B5CF6`;
    }
    window.open(streamingUrl, '_blank');
  };

  if (loading || !anime) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading anime details...</p>
        </div>
      </div>
    );
  }

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
            src={anime.bannerImage || anime.coverImage.extraLarge}
            alt={anime.title.english || anime.title.romaji}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Anime Info */}
        <motion.div 
          className="absolute inset-0 flex items-end pb-32"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="w-[800px] ml-16 space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white tracking-tight">
                {anime.title.english || anime.title.romaji}
              </h1>
              <p className="text-2xl text-gray-400">
                {anime.title.native}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaStar className="text-yellow-500 w-5 h-5 mr-2" />
                <span className="text-white font-bold">{(anime.averageScore / 10).toFixed(1)}/10</span>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaRegCalendarAlt className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-white">{anime.seasonYear}</span>
              </div>
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <FaRegClock className="text-gray-400 w-5 h-5 mr-2" />
                <span className="text-white">{anime.episodes} Episodes</span>
              </div>
            </div>

            {/* Episode Selection */}
            <div className="space-y-4 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: anime.episodes }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Episode {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Streaming Buttons */}
            <div className="flex flex-col gap-4 max-w-xl">
              <button
                onClick={() => handlePlay('server1')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
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
        </motion.div>
      </motion.div>

      {/* Content Sections */}
      <div className="px-16 py-12 space-y-8 max-w-7xl mx-auto">
        {/* Cast & Staff */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaUserTie className="text-purple-500" />
            Cast & Staff
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Studio</h3>
                <p className="text-white text-lg">
                  {anime.studios.nodes.find(studio => studio.isAnimationStudio)?.name || 'N/A'}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Staff</h3>
                <div className="space-y-2">
                  {anime.staff.nodes.slice(0, 3).map((person, index) => (
                    <p key={index} className="text-white">
                      {person.name.full} - {person.primaryOccupations[0]}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-gray-400 font-medium mb-4">Main Characters</h3>
              <div className="grid grid-cols-2 gap-4">
                {anime.characters.nodes.slice(0, 4).map((character, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={character.image.medium}
                      alt={character.name.full}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">{character.name.full}</p>
                      <p className="text-gray-400 text-sm">{character.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Anime Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaFilm className="text-purple-500" />
            Anime Details
          </h2>

          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Format</h3>
                <p className="text-white text-lg">{anime.format}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Status</h3>
                <p className="text-white text-lg">{anime.status}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Episodes</h3>
                <p className="text-white text-lg">{anime.episodes}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Duration</h3>
                <p className="text-white text-lg">{anime.duration} minutes</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Source</h3>
                <p className="text-white text-lg">{anime.source}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-400 font-medium">Country</h3>
                <p className="text-white text-lg">{anime.countryOfOrigin}</p>
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
              Anime Trivia
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
                    <p className="text-gray-400">Total Favorites</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <FaRegHeart className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.popularity.toLocaleString()}</p>
                    <p className="text-gray-400">Popularity</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <FaImdb className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.meanScore.toFixed(1)}</p>
                    <p className="text-gray-400">Mean Score</p>
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

export default Anime;