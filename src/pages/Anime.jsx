import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

function Anime() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

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
        setAnime(data.data.Media);
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
          <div className="w-[600px] ml-16 space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white">
                {anime.title.english || anime.title.romaji}
              </h1>
              <p className="text-gray-400">
                Original Title: {anime.title.native}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-2" />
                <span className="text-white font-bold">{(anime.averageScore / 10).toFixed(1)}/10</span>
              </div>
              <span className="text-white/70">{anime.seasonYear}</span>
              <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">
                {anime.format}
              </span>
              <span className="text-white/70">{anime.episodes} Episodes</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {anime.genres.map(genre => (
                <span 
                  key={genre}
                  className="px-3 py-1 bg-white/10 rounded-full text-white text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-lg text-white/90" 
               dangerouslySetInnerHTML={{ __html: anime.description }}
            />

            {/* Episode Selection */}
            <div className="flex space-x-4 mb-4">
              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20"
              >
                {Array.from({ length: anime.episodes }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Episode {i + 1}
                  </option>
                ))}
              </select>
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

      {/* Anime Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        {/* Key Information */}
        <motion.div 
          className="grid grid-cols-2 gap-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Anime Details</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <FaFilm className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Studio</p>
                  <p className="text-white">
                    {anime.studios.nodes.find(studio => studio.isAnimationStudio)?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaVideo className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Format</p>
                  <p className="text-white">{anime.format}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaClock className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Episode Duration</p>
                  <p className="text-white">{anime.duration} minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaGlobe className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Country of Origin</p>
                  <p className="text-white">{anime.countryOfOrigin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Characters */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Main Characters</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                {anime.characters.nodes.map((character, index) => (
                  <div key={index} className="flex items-center space-x-3">
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
              <p className="text-gray-400">Status</p>
              <p className="text-white">{anime.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Season</p>
              <p className="text-white">{`${anime.season} ${anime.seasonYear}`}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Source</p>
              <p className="text-white">{anime.source}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Mean Score</p>
              <p className="text-white">{anime.meanScore / 10}/10</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Popularity</p>
              <p className="text-white">{anime.popularity.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Favorites</p>
              <p className="text-white">{anime.favourites.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Reviews */}
        {anime.reviews?.nodes?.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">User Reviews</h2>
            <div className="space-y-4">
              {anime.reviews.nodes.slice(0, 3).map((review, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{review.user.name}</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                      <span className="text-white">{review.score}/10</span>
                    </div>
                  </div>
                  <p className="text-gray-400">{review.summary}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {anime.recommendations?.nodes?.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Recommended Anime</h2>
            <div className="grid grid-cols-6 gap-4">
              {anime.recommendations.nodes.slice(0, 6).map((rec, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={rec.mediaRecommendation.coverImage.medium}
                    alt={rec.mediaRecommendation.title.romaji}
                    className="w-full h-auto rounded-lg"
                  />
                  <p className="text-white font-medium text-sm">
                    {rec.mediaRecommendation.title.romaji} ```jsx
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tags */}
        {anime.tags && anime.tags.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {anime.tags.map(tag => (
                <span 
                  key={tag.name}
                  className="px-3 py-1 bg-white/10 rounded-full text-white text-sm"
                  title={tag.description}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rankings */}
        {anime.rankings && anime.rankings.length > 0 && (
          <motion.div 
            className="bg-white/5 rounded-xl p-6 border border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Rankings</h2>
            <div className="grid grid-cols-3 gap-4">
              {anime.rankings.map((ranking, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-2">
                    <FaTrophy className="text-yellow-500 w-5 h-5" />
                    <div>
                      <p className="text-white font-medium">#{ranking.rank}</p>
                      <p className="text-gray-400 text-sm">
                        {ranking.type} {ranking.season} {ranking.year}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Anime;