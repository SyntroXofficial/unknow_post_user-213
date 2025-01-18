import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';

function Home() {
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [dramaShows, setDramaShows] = useState([]);
  const [featured, setFeatured] = useState(null);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [
          trendingRes,
          newReleasesRes,
          popularMoviesRes,
          popularTVRes,
          animeRes,
          actionRes,
          dramaRes
        ] = await Promise.all([
          axios.get('https://api.themoviedb.org/3/trending/all/day', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
              'sort_by': 'release_date.desc',
              'vote_count.gte': 100,
              'vote_average.gte': 6
            },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/movie/popular', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/tv/popular', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/tv', {
            params: {
              'with_keywords': '210024|6075',
              'sort_by': 'vote_average.desc',
              'vote_count.gte': 100
            },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
              'with_genres': '28',
              'sort_by': 'popularity.desc',
              'vote_count.gte': 100
            },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/tv', {
            params: {
              'with_genres': '18',
              'sort_by': 'popularity.desc',
              'vote_count.gte': 100
            },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);
        
        setTrending(trendingRes.data.results);
        setNewReleases(newReleasesRes.data.results);
        setPopularMovies(popularMoviesRes.data.results);
        setPopularTVShows(popularTVRes.data.results);
        setTopAnime(animeRes.data.results);
        setActionMovies(actionRes.data.results);
        setDramaShows(dramaRes.data.results);
        setFeatured(trendingRes.data.results[0]);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  const ContentRow = ({ title, items }) => (
    <section className="animate-fade-up">
      <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-6 gap-4">
        {items.slice(0, 6).map((item) => (
          <Link 
            key={item.id} 
            to={`/${item.media_type || (title.includes('TV') || title === 'Top Anime' ? 'tv' : 'movie')}/${item.id}`}
            className="transform transition-all duration-300 hover:scale-110 hover:z-20"
          >
            <div className="relative group">
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="w-full rounded-md shadow-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-lg">{item.title || item.name}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                      <span className="text-white">{item.vote_average?.toFixed(1)}</span>
                    </div>
                    <span className="text-white/70">•</span>
                    <span className="text-white/70">
                      {(item.release_date || item.first_air_date)?.split('-')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Featured Content Hero Section */}
      {featured && (
        <div className="relative h-[100vh] w-full">
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
              alt={featured.title || featured.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
          </div>
          
          <div className="absolute bottom-32 left-0 px-24 space-y-4 w-[50%] z-10">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-500 text-white px-4 py-1 rounded-full font-bold tracking-wider">
                  TRENDING
                </div>
                <div className="flex items-center bg-purple-500/20 backdrop-blur-sm px-4 py-1 rounded-full">
                  <FaStar className="text-yellow-500 w-4 h-4" />
                  <span className="text-white ml-2 font-semibold">
                    {Math.round(featured.vote_average * 10)}% Match
                  </span>
                </div>
                <div className="bg-purple-500/20 backdrop-blur-sm text-white px-4 py-1 rounded-full font-bold tracking-wider">
                  #{featured.media_type === 'movie' ? 'MOVIES' : 'TV SHOWS'}
                </div>
              </div>
            </div>
            <h1 className="text-7xl font-black text-white tracking-tight leading-none drop-shadow-lg">
              {featured.title || featured.name}
            </h1>
            <p className="text-xl text-white line-clamp-3 font-medium drop-shadow-lg max-w-4xl">
              {featured.overview}
            </p>
            <div className="flex space-x-4 mt-8">
              <Link 
                to={`/${featured.media_type}/${featured.id}`}
                className="flex items-center px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 font-bold text-xl"
              >
                <FaPlay className="mr-2 w-6 h-6" /> Watch Now
              </Link>
              <button className="flex items-center px-8 py-3 bg-gray-500/40 text-white rounded-lg hover:bg-gray-500/60 transition-all duration-300 transform hover:scale-105 font-bold text-xl backdrop-blur-sm">
                <FaInfoCircle className="mr-2 w-6 h-6" /> Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 px-16 pb-16 space-y-12 bg-[#0a0a0a]">
        <ContentRow title="Trending Now" items={trending} />
        <ContentRow title="New Releases" items={newReleases} />
        <ContentRow title="Popular Movies" items={popularMovies} />
        <ContentRow title="Popular TV Shows" items={popularTVShows} />
        <ContentRow title="Popular Anime" items={topAnime} />
        <ContentRow title="Action & Adventure" items={actionMovies} />
        <ContentRow title="Best Drama Series" items={dramaShows} />
      </div>
    </div>
  );
}

export default Home;