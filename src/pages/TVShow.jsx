import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaCalendar, FaClock, FaGlobe, FaServer } from 'react-icons/fa';

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
      case 'viper':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        break;
      case 'superembed':
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}&server=2`;
        break;
      default:
        streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    }
    window.open(streamingUrl, '_blank');
  };

  if (!show || !seasonDetails || !credits) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );

  const matchScore = Math.round(show.vote_average * 10);
  const creators = show.created_by || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="relative">
        {/* Background Image */}
        <div className="relative h-[100vh] animate-fade-in">
          <img
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Show Info */}
        <div className="absolute top-1/2 -translate-y-1/2 left-16 w-1/2 space-y-6 animate-fade-up">
          <h1 className="text-6xl font-bold text-white">{show.name}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-purple-500 font-bold">{matchScore}% Match</span>
            <span className="text-white/70">{show.first_air_date?.split('-')[0]}</span>
            <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">TV-MA</span>
            <span className="text-white/70">{show.number_of_seasons} Seasons</span>
            <span className="flex items-center">
              <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
              {show.vote_average?.toFixed(1)}
            </span>
          </div>
          <p className="text-lg text-white/90 line-clamp-3">{show.overview}</p>
          
          {/* Episode Selection */}
          <div className="flex gap-4 items-center">
            <select 
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
              className="bg-[#0a0a0a] text-white px-4 py-2 rounded border border-purple-500/50 focus:border-purple-500 focus:outline-none"
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
              className="bg-[#0a0a0a] text-white px-4 py-2 rounded border border-purple-500/50 focus:border-purple-500 focus:outline-none"
            >
              {Array.from({ length: seasonDetails.episodes?.length || 0 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Episode {i + 1}
                </option>
              ))}
            </select>
          </div>

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

      {/* Additional Show Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12 animate-fade-up">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">About {show.name}</h2>
            <div className="space-y-4 text-white/70">
              <p><span className="text-white">Created by:</span> {creators.map(c => c.name).join(', ')}</p>
              <p><span className="text-white">Cast:</span> {credits.cast.slice(0, 5).map(actor => actor.name).join(', ')}</p>
              <p><span className="text-white">Genres:</span> {show.genres?.map(g => g.name).join(', ')}</p>
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <FaCalendar className="text-purple-500" />
                  <span>{show.first_air_date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-purple-500" />
                  <span>{show.episode_run_time?.[0] || 'N/A'} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaGlobe className="text-purple-500" />
                  <span>{show.original_language.toUpperCase()}</span>
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

        {/* Current Season Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Season {season} Episodes</h2>
          <div className="grid grid-cols-2 gap-6">
            {seasonDetails.episodes?.slice(0, 4).map(episode => (
              <div key={episode.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 flex space-x-4">
                <img
                  src={episode.still_path
                    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                    : 'https://via.placeholder.com/300x170?text=No+Image'
                  }
                  alt={episode.name}
                  className="w-40 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">Episode {episode.episode_number}: {episode.name}</p>
                  <p className="text-white/70 text-sm line-clamp-2">{episode.overview}</p>
                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                    <span className="text-white/70">{episode.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TVShow;