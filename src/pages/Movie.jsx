import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaStar } from 'react-icons/fa';

function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
          headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
        });
        setMovie(movieResponse.data);
      } catch (error) {
        console.error('Error fetching movie:', error);
      }
    };

    fetchMovie();
  }, [id]);

  const handlePlay = () => {
    const streamingUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
    window.open(streamingUrl, '_blank');
  };

  if (!movie) return (
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
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Movie Info */}
        <div className="absolute top-1/2 -translate-y-1/2 left-16 w-1/2 space-y-6 animate-fade-up">
          <h1 className="text-6xl font-bold text-white">{movie.title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-purple-500 font-bold">98% Match</span>
            <span className="text-gray-400">{movie.release_date?.split('-')[0]}</span>
            <span className="px-2 py-1 border border-gray-400 text-gray-400 text-sm">{movie.adult ? '18+' : 'PG-13'}</span>
            <span className="text-gray-400">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            <span className="flex items-center">
              <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>
          <p className="text-lg text-gray-200 line-clamp-3">{movie.overview}</p>
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

      {/* Additional Movie Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] animate-fade-up">
        <h2 className="text-2xl font-bold text-white mb-4">About {movie.title}</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="text-gray-400">
            <p><span className="text-gray-200">Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
            <p><span className="text-gray-200">Cast:</span> Loading...</p>
            <p><span className="text-gray-200">Director:</span> Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Movie;