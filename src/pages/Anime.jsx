import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaCalendar, FaClock, FaGlobe, FaPlay, FaInfoCircle, FaUser, FaTv, FaLanguage } from 'react-icons/fa';

function Anime() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

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
              studios {
                nodes {
                  name
                }
              }
              characters(sort: ROLE) {
                nodes {
                  name {
                    full
                  }
                  image {
                    medium
                  }
                  role
                }
              }
              staff {
                nodes {
                  name {
                    full
                  }
                  role
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

  const handlePlay = () => {
    const streamingUrl = `https://player.videasy.net/anime/${id}?color=8B5CF6`;
    window.open(streamingUrl, '_blank');
  };

  if (loading || !anime) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-2xl">Loading anime details...</div>
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
          <div className="w-[500px] ml-16 space-y-6">
            <h1 className="text-5xl font-bold text-white">
              {anime.title.english || anime.title.romaji}
            </h1>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-2" />
                <span className="text-white font-bold">{anime.averageScore}% Match</span>
              </div>
              <span className="text-white/70">{anime.seasonYear}</span>
              <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">
                {anime.format}
              </span>
              <span className="text-white/70">{anime.episodes} Episodes</span>
            </div>

            <p className="text-lg text-white/90" 
               dangerouslySetInnerHTML={{ __html: anime.description }}
            />

            {/* Streaming Button */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handlePlay}
                className="flex items-center justify-center px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-base font-semibold group w-full"
              >
                <FaPlay className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                Watch Now in 4K
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Anime Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        {/* Information */}
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
                <FaUser className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Studios</p>
                  <p className="text-white">
                    {anime.studios.nodes.map(studio => studio.name).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaTv className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Format</p>
                  <p className="text-white">{anime.format}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaLanguage className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Original Title</p>
                  <p className="text-white">{anime.title.native}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaCalendar className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Aired</p>
                  <p className="text-white">
                    {`${anime.startDate.year}.${anime.startDate.month}.${anime.startDate.day} - 
                      ${anime.endDate.year ? `${anime.endDate.year}.${anime.endDate.month}.${anime.endDate.day}` : 'Ongoing'}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Characters */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Main Characters</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                {anime.characters.nodes.slice(0, 6).map((character, index) => (
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
              <p className="text-gray-400">Episode Duration</p>
              <p className="text-white">{anime.duration} minutes</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Genres</p>
              <p className="text-white">{anime.genres.join(', ')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Season</p>
              <p className="text-white">{`${anime.season} ${anime.seasonYear}`}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Popularity</p>
              <p className="text-white">{anime.popularity.toLocaleString()} users</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">Average Score</p>
              <p className="text-white">{anime.averageScore}%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Anime;
