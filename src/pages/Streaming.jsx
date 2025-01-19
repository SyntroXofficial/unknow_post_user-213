import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaInfoCircle, FaStar, FaCalendar, FaLanguage, FaFilm, FaTv, FaSearch } from 'react-icons/fa';

function Streaming() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState('all');
  const [genre, setGenre] = useState('all');
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  const genres = [
    { id: 'all', name: 'All Genres' },
    { id: '28', name: 'Action' },
    { id: '12', name: 'Adventure' },
    { id: '16', name: 'Animation' },
    { id: '35', name: 'Comedy' },
    { id: '80', name: 'Crime' },
    { id: '99', name: 'Documentary' },
    { id: '18', name: 'Drama' },
    { id: '10751', name: 'Family' },
    { id: '14', name: 'Fantasy' },
    { id: '36', name: 'History' },
    { id: '27', name: 'Horror' },
    { id: '10402', name: 'Music' },
    { id: '9648', name: 'Mystery' },
    { id: '10749', name: 'Romance' },
    { id: '878', name: 'Science Fiction' },
    { id: '10770', name: 'TV Movie' },
    { id: '53', name: 'Thriller' },
    { id: '10752', name: 'War' },
    { id: '37', name: 'Western' },
    { id: '10759', name: 'Action & Adventure' },
    { id: '10762', name: 'Kids' },
    { id: '10763', name: 'News' },
    { id: '10764', name: 'Reality' },
    { id: '10765', name: 'Sci-Fi & Fantasy' },
    { id: '10766', name: 'Soap' },
    { id: '10767', name: 'Talk' },
    { id: '10768', name: 'War & Politics' }
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Reset all states first
        setTrending([]);
        setNewReleases([]);
        setPopularMovies([]);
        setActionMovies([]);
        setTopAnime([]);
        setPopularTVShows([]);

        const baseParams = {
          'vote_count.gte': 100,
          page: 1,
          ...(genre !== 'all' && { with_genres: genre })
        };

        // Fetch movie content if needed
        if (mediaType === 'all' || mediaType === 'movie') {
          try {
            const [trendingRes, newReleasesRes, popularMoviesRes] = await Promise.all([
              axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: {
                  ...baseParams,
                  sort_by: 'popularity.desc',
                  'vote_average.gte': 7.0
                },
                headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
              }),
              axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: {
                  ...baseParams,
                  sort_by: 'release_date.desc',
                  'primary_release_date.lte': new Date().toISOString().split('T')[0],
                  'primary_release_date.gte': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                },
                headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
              }),
              axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: {
                  ...baseParams,
                  sort_by: 'vote_average.desc',
                  'vote_average.gte': 7.5
                },
                headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
              })
            ]);

            setTrending(trendingRes.data.results?.filter(item => item.backdrop_path && item.poster_path) || []);
            setNewReleases(newReleasesRes.data.results?.filter(item => item.poster_path) || []);
            setPopularMovies(popularMoviesRes.data.results?.filter(item => item.poster_path) || []);

            // Fetch action movies only if no specific genre is selected or if action genre is selected
            if (genre === 'all' || genre === '28') {
              const actionRes = await axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: {
                  ...baseParams,
                  with_genres: '28',
                  'vote_average.gte': 7.0,
                  sort_by: 'popularity.desc'
                },
                headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
              });
              setActionMovies(actionRes.data.results?.filter(item => item.poster_path) || []);
            }
          } catch (error) {
            console.error('Error fetching movie content:', error);
          }
        }

        // Fetch TV content if needed
        if (mediaType === 'all' || mediaType === 'tv') {
          try {
            const tvShowsRes = await axios.get('https://api.themoviedb.org/3/discover/tv', {
              params: {
                ...baseParams,
                'vote_average.gte': 7.5,
                sort_by: 'popularity.desc',
                with_original_language: 'en'
              },
              headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
            });

            const filteredTVShows = (tvShowsRes.data.results || []).filter(show =>
              show.poster_path &&
              show.backdrop_path &&
              show.overview &&
              show.overview.length > 50
            );

            setPopularTVShows(filteredTVShows);

            // Fetch anime only if no specific genre is selected or if animation genre is selected
            if (genre === 'all' || genre === '16') {
              const animeRes = await axios.get('https://api.themoviedb.org/3/discover/tv', {
                params: {
                  ...baseParams,
                  with_genres: '16',
                  with_original_language: 'ja',
                  sort_by: 'popularity.desc',
                  'vote_average.gte': 7.0
                },
                headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
              });

              const animeResults = (animeRes.data.results || []).filter(show => 
                show.original_language === 'ja' && 
                show.poster_path && 
                !show.name.toLowerCase().includes('dub') &&
                !show.name.toLowerCase().includes('dubbed')
              );

              setTopAnime(animeResults);
            }
          } catch (error) {
            console.error('Error fetching TV content:', error);
          }
        }
      } catch (error) {
        console.error('Error in fetchContent:', error);
      }
    };

    fetchContent();
  }, [mediaType, genre]);

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

  const ContentRow = ({ title, items }) => {
    if (!items || items.length === 0) return null;

    return (
      <section className="animate-fade-up">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {items.slice(0, 14).map((item) => (
            <Link 
              key={item.id}
              to={`/${item.media_type || (title.includes('TV') || title === 'Popular Anime' ? 'tv' : 'movie')}/${item.id}`}
              className="transform transition-all duration-300 hover:scale-105 group"
            >
              <div className="relative rounded-lg overflow-hidden bg-black shadow-lg border border-gray-800/50 group-hover:shadow-[0_0_50px_rgba(109,40,217,0.4)] group-hover:border-purple-500/50 transition-all duration-300">
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
  };

  return (
    <div className="min-h-screen bg-black">
      {trending.length > 0 && (
        <div className="relative h-[85vh]">
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/p/original${trending[currentFeaturedIndex].backdrop_path}`}
              alt={trending[currentFeaturedIndex].title || trending[currentFeaturedIndex].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
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
                  to={`/${trending[currentFeaturedIndex].media_type || 'movie'}/${trending[currentFeaturedIndex].id}`}
                  className="flex items-center px-12 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 text-xl font-semibold"
                >
                  <FaPlay className="mr-2" /> Watch Now
                </Link>
                <Link
                  to={`/${trending[currentFeaturedIndex].media_type || 'movie'}/${trending[currentFeaturedIndex].id}`}
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
                  <span className="text-lg font-medium">
                    #{(trending[currentFeaturedIndex].media_type || 'movie').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Section */}
      <div className="relative z-10 px-12 pt-8 pb-4 flex items-center space-x-4">
        {/* Media Type Dropdown */}
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="bg-[#111] border border-purple-500/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 w-32"
        >
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </select>

        {/* Genre Dropdown */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="bg-[#111] border border-purple-500/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 w-48"
        >
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              setSearchQuery('');
            }
          }} 
          className="relative max-w-md"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#111] border border-purple-500/50 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-purple-500 transition"
          >
            <FaSearch className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="relative z-10 px-12 pb-16 space-y-12 bg-black">
        {(mediaType === 'all' || mediaType === 'movie') && (
          <>
            <ContentRow title="Trending Now" items={trending} />
            <ContentRow title="New Releases" items={newReleases} />
            <ContentRow title="Popular Movies" items={popularMovies} />
            {(genre === 'all' || genre === '28') && (
              <ContentRow title="Action & Adventure" items={actionMovies} />
            )}
          </>
        )}
        
        {(mediaType === 'all' || mediaType === 'tv') && (
          <>
            <ContentRow title="Popular TV Shows" items={popularTVShows} />
            {(genre === 'all' || genre === '16') && (
              <ContentRow title="Popular Anime" items={topAnime} />
            )}
          </>
        )}

        <div className="mt-16 p-6 bg-black rounded-lg border border-gray-800">
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

export default Streaming;