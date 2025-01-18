import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaStar } from 'react-icons/fa';

function TVShow() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const showResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
          headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
        });
        setShow(showResponse.data);
      } catch (error) {
        console.error('Error fetching TV show:', error);
      }
    };

    fetchShow();
  }, [id]);

  const handlePlay = () => {
    const streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    window.open(streamingUrl, '_blank');
  };

  if (!show) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[68px]">
      <div className="relative">
        {/* Background Image */}
        <div className="relative h-[80vh] animate-fade-in">
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
            <span className="text-purple-500 font-bold">98% Match</span>
            <span className="text-gray-400">{show.first_air_date?.split('-')[0]}</span>
            <span className="px-2 py-1 border border-gray-400 text-gray-400 text-sm">TV-MA</span>
            <span className="text-gray-400">{show.number_of_seasons} Seasons</span>
            <span className="flex items-center">
              <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
              {show.vote_average?.toFixed(1)}
            </span>
          </div>
          <p className="text-lg text-gray-200 line-clamp-3">{show.overview}</p>
          
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
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Episode {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={handlePlay}
              className="flex items-center px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 font-semibold text-xl"
            >
              <FaPlay className="mr-2" /> Play
            </button>
          </div>
        </div>
      </div>

      {/* Additional Show Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] animate-fade-up">
        <h2 className="text-2xl font-bold text-white mb-4">About {show.name}</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="text-gray-400">
            <p><span className="text-gray-200">Genres:</span> {show.genres?.map(g => g.name).join(', ')}</p>
            <p><span className="text-gray-200">Cast:</span> Loading...</p>
            <p><span className="text-gray-200">Created by:</span> {show.created_by?.map(c => c.name).join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TVShow;