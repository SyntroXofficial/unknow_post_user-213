import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaInfoCircle, FaStar, FaCalendar, FaLanguage, FaFilm, FaTv } from 'react-icons/fa';

function Home() {
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch anime with better filtering
        const animeResponse = await axios.get('https://api.themoviedb.org/3/discover/tv', {
          params: {
            with_genres: '16', // Animation genre
            with_original_language: 'ja', // Japanese content
            sort_by: 'popularity.desc',
            'vote_count.gte': 100, // Minimum vote count for better quality
            page: 1
          },
          headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
        });

        // Fetch popular TV shows with better filtering
        const tvShowsResponse = await axios.get('https://api.themoviedb.org/3/discover/tv', {
          params: {
            sort_by: 'popularity.desc',
            'vote_count.gte': 1000, // Higher vote count for better quality
            'vote_average.gte': 7.5, // Minimum rating of 7.5
            with_original_language: 'en', // English shows
            page: 1
          },
          headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
        });

        const [
          trendingRes,
          newReleasesRes,
          popularMoviesRes,
          actionRes
        ] = await Promise.all([
          axios.get('https://api.themoviedb.org/3/trending/all/day', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/movie/popular', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { 
              with_genres: '28',
              'vote_count.gte': 500,
              'vote_average.gte': 7.0
            },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        // Filter anime to ensure better quality results
        const animeResults = animeResponse.data.results.filter(show => 
          show.original_language === 'ja' && 
          show.poster_path && 
          show.vote_average >= 7.0 && // Minimum rating threshold
          !show.name.toLowerCase().includes('dub') &&
          !show.name.toLowerCase().includes('dubbed')
        );

        // Filter TV shows to remove any low-quality content
        const filteredTVShows = tvShowsResponse.data.results.filter(show =>
          show.poster_path &&
          show.backdrop_path &&
          show.overview && // Must have a description
          show.overview.length > 50 // Description must be meaningful
        );

        setTrending(trendingRes.data.results);
        setNewReleases(newReleasesRes.data.results);
        setPopularMovies(popularMoviesRes.data.results);
        setPopularTVShows(filteredTVShows);
        setTopAnime(animeResults);
        setActionMovies(actionRes.data.results);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    if (trending.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === trending.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [trending]);

  const getTypeBadge = (type) => {
    return type === 'movie' ? (
      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs font-semibold">
        <FaFilm className="inline-block mr-1 w-3 h-3" />
        Movie
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold">
        <FaTv className="inline-block mr-1 w-3 h-3" />
        TV Show
      </span>
    );
  };

  const ContentRow = ({ title, items }) => (
    <section className="animate-fade-up">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {items.slice(0, 14).map((item) => (
          <Link 
            key={item.id}
            to={`/${item.media_type || (title.includes('TV') || title === 'Popular Anime' ? 'tv' : 'movie')}/${item.id}`}
            className="transform transition-all duration-300 hover:scale-105 group"
          >
            <div className="relative rounded-lg overflow-hidden bg-[#111] shadow-lg border border-gray-800/50">
              <img
                src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                alt={item.title || item.name}
                className="w-full aspect-[2/3] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="mb-1">
                    {getTypeBadge(item.media_type || (title.includes('TV') || title === 'Popular Anime' ? 'tv' : 'movie'))}
                  </div>
                  <p className="text-white font-bold text-sm mb-1 line-clamp-1">
                    {item.title || item.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-1">
                    <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                      <FaStar className="text-yellow-500 w-2.5 h-2.5 mr-1" />
                      <span className="text-white text-xs">
                        {item.vote_average?.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                      <FaCalendar className="text-gray-400 w-2.5 h-2.5 mr-1" />
                      <span className="text-white text-xs">
                        {(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                      <FaLanguage className="text-gray-400 w-2.5 h-2.5 mr-1" />
                      <span className="text-white text-xs">
                        {item.original_language?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs line-clamp-2">
                    {item.overview}
                  </p>
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
      {trending.length > 0 && (
        <div className="relative h-[85vh]">
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/p/original${trending[currentFeaturedIndex].backdrop_path}`}
              alt={trending[currentFeaturedIndex].title || trending[currentFeaturedIndex].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 pb-32 px-12">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl font-bold text-white line-clamp-2">
                {trending[currentFeaturedIndex].title || trending[currentFeaturedIndex].name}
              </h1>
              <p className="text-lg text-white/90 line-clamp-2">
                {trending[currentFeaturedIndex].overview}
              </p>
              <div className="flex space-x-4">
                <Link
                  to={`/${trending[currentFeaturedIndex].media_type}/${trending[currentFeaturedIndex].id}`}
                  className="flex items-center px-12 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 text-xl font-semibold"
                >
                  <FaPlay className="mr-2" /> Watch Now
                </Link>
                <Link
                  to={`/${trending[currentFeaturedIndex].media_type}/${trending[currentFeaturedIndex].id}`}
                  className="flex items-center px-12 py-4 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 text-xl font-semibold"
                >
                  <FaInfoCircle className="mr-2" /> More Info
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <div className="px-6 py-2 bg-purple-500 text-white font-bold rounded-lg">
                  TRENDING
                </div>
                <div className="flex items-center space-x-4 px-6 py-2 bg-black/50 backdrop-blur-sm text-white font-bold rounded-lg">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 w-5 h-5 mr-2" />
                    <span className="text-lg">{Math.round(trending[currentFeaturedIndex].vote_average * 10)}% Match</span>
                  </div>
                  <span className="text-lg font-medium">#{trending[currentFeaturedIndex].media_type.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 px-12 pb-16 space-y-12 bg-[#0a0a0a]">
        <ContentRow title="Trending Now" items={trending} />
        <ContentRow title="New Releases" items={newReleases} />
        <ContentRow title="Popular Movies" items={popularMovies} />
        <ContentRow title="Popular TV Shows" items={popularTVShows} />
        <ContentRow title="Popular Anime" items={topAnime} />
        <ContentRow title="Action & Adventure" items={actionMovies} />

        <div className="mt-16 p-6 bg-[#111] rounded-lg border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-3">Warning Notice</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            This website does not host, stream, or provide any movies, TV shows, or related content. All media content accessible through this site is hosted by third-party platforms or services. Any actions taken, whether legal or illegal, in relation to such content are the sole responsibility of the individuals or entities hosting the content. We are not liable for any consequences arising from the use of third-party links or services.
          </p>
          <p className="text-gray-400 text-sm mt-3">
            Please ensure you comply with all applicable laws and regulations when accessing or using external content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;