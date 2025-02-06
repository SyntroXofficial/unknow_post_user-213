import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaServer, FaPlay, FaStar, FaCalendar, FaLanguage, FaFilm, FaTv, FaGlobe, FaUsers, FaClock,
  FaTheaterMasks, FaGlobeAmericas, FaMoneyBill, FaUserFriends, FaRegClock, FaRegCalendarAlt, FaTags, FaImdb, FaTicketAlt,
  FaAward, FaVideo, FaClosedCaptioning, FaVolumeUp, FaUserTie, FaRegEye, FaRegHeart, FaRegBookmark, FaRegCommentAlt
} from 'react-icons/fa';

function Player() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [selectedServer, setSelectedServer] = useState('server1');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [
          contentRes, 
          creditsRes, 
          keywordsRes,
          recommendationsRes,
          reviewsRes,
          videosRes
        ] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/${type}/${id}/credits`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/${type}/${id}/keywords`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/${type}/${id}/recommendations`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/${type}/${id}/reviews`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get(`https://api.themoviedb.org/3/${type}/${id}/videos`, {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setContent({ 
          ...contentRes.data, 
          credits: creditsRes.data,
          keywords: keywordsRes.data,
          reviews: reviewsRes.data.results,
          videos: videosRes.data.results
        });
        
        setRecommendations(recommendationsRes.data.results);

        if (type === 'tv') {
          const seasonResponse = await axios.get(
            `https://api.themoviedb.org/3/tv/${id}/season/${season}`,
            { headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` } }
          );
          setSeasonDetails(seasonResponse.data);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, [type, id, season]);

  const getEmbedUrl = () => {
    const baseUrl = {
      server1: 'https://multiembed.mov',
      server2: 'https://multiembed.mov/directstream.php',
      server3: 'https://embed.su/embed',
      server4: 'https://vidsrc.cc/v3/embed',
      server5: 'https://player.videasy.net/4k-uhd'
    }[selectedServer];

    if (type === 'tv') {
      return `${baseUrl}/${type}/${id}/${season}/${episode}`;
    }
    return `${baseUrl}/${type}/${id}`;
  };

  const serverInfo = {
    server1: { name: 'Primary Server', quality: '1080p', features: ['Fast Loading', 'Multi-Audio'] },
    server2: { name: 'Backup Server', quality: '1080p', features: ['Stable Connection'] },
    server3: { name: 'Alternative Server', quality: '1080p', features: ['Low Latency'] },
    server4: { name: 'Premium Server', quality: '1080p/4K', features: ['High Quality', 'HDR'] },
    server5: { name: '4K UHD Server', quality: '4K UHD', features: ['Ultra HD', 'Dolby Vision'] }
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-2xl">Loading content...</div>
      </div>
    );
  }

  const director = content.credits?.crew?.find(person => person.job === "Director");
  const writers = content.credits?.crew?.filter(person => 
    ["Writer", "Screenplay", "Story"].includes(person.job)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Player Section */}
      <div className="player-container relative w-full aspect-[16/9] max-h-[600px] bg-black">
        <iframe
          src={getEmbedUrl()}
          className="player-iframe w-full h-full"
          allowFullScreen
          title="Content Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="no-referrer"
          loading="lazy"
          style={{
            border: 'none',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            zIndex: 999999
          }}
        />
      </div>

      {/* Controls and Info Section */}
      <div className="px-8 py-6">
        {/* Servers Grid */}
        <div className="grid grid-cols-6 gap-2 mb-8">
          <button
            onClick={() => navigate('/streaming')}
            className={`flex flex-col items-center p-4 rounded-lg bg-black text-white border border-white hover:bg-white hover:text-black transition-all duration-200`}
          >
            <FaArrowLeft className="w-5 h-5 mb-2" />
            <span className="font-medium">Back to Streaming</span>
          </button>

          {Object.entries(serverInfo).map(([server, info]) => (
            <button
              key={server}
              onClick={() => setSelectedServer(server)}
              className={`flex flex-col items-center p-4 rounded-lg ${
                selectedServer === server
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-white hover:text-black'
              } transition-all duration-200`}
            >
              <FaServer className="w-5 h-5 mb-2" />
              <span className="font-medium">{info.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                selectedServer === server
                  ? 'bg-black/10 text-black'
                  : 'bg-white/10 text-white'
              }`}>
                {info.quality}
              </span>
              <div className="mt-2 text-xs opacity-75">
                {info.features.map((feature, index) => (
                  <div key={index}>{feature}</div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Left Column - Content Info & Controls */}
          <div className="col-span-3 space-y-6">
            {/* Content Info */}
            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-white">
                  {content.title || content.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <a
                    href={`https://www.imdb.com/title/${content.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400"
                  >
                    <FaImdb className="w-6 h-6" />
                    <span>IMDb</span>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-500 w-4 h-4" />
                  <span className="text-white">{content.vote_average?.toFixed(1)} Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaRegCalendarAlt className="text-gray-400 w-4 h-4" />
                  <span className="text-white">
                    {(content.release_date || content.first_air_date)?.split('-')[0]}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaRegClock className="text-gray-400 w-4 h-4" />
                  <span className="text-white">
                    {content.runtime || content.episode_run_time?.[0]} mins
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaRegEye className="text-gray-400 w-4 h-4" />
                  <span className="text-white">
                    {content.popularity?.toFixed(0)}K views
                  </span>
                </div>
              </div>
            </div>

            {/* Episode Selection for TV Shows */}
            {type === 'tv' && (
              <div className="bg-[#1f1f1f] p-6 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Episode Selection</h2>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <FaTv className="w-4 h-4" />
                    <span>{content.number_of_seasons} Seasons</span>
                    <span>•</span>
                    <span>{content.number_of_episodes} Episodes</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={season}
                    onChange={(e) => setSeason(Number(e.target.value))}
                    className="bg-black text-white px-4 py-2 rounded-lg border border-white/20 focus:border-white focus:outline-none"
                  >
                    {Array.from({ length: content.number_of_seasons }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                    ))}
                  </select>
                  <select
                    value={episode}
                    onChange={(e) => setEpisode(Number(e.target.value))}
                    className="bg-black text-white px-4 py-2 rounded-lg border border-white/20 focus:border-white focus:outline-none"
                  >
                    {Array.from({ length: seasonDetails?.episodes?.length || 0 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Episode {i + 1}</option>
                    ))}
                  </select>
                </div>

                {seasonDetails?.episodes?.[episode - 1] && (
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold">
                        Episode {episode}: {seasonDetails.episodes[episode - 1].name}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span>{seasonDetails.episodes[episode - 1].air_date}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {seasonDetails.episodes[episode - 1].overview}
                    </p>
                    {seasonDetails.episodes[episode - 1].still_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${seasonDetails.episodes[episode - 1].still_path}`}
                        alt={seasonDetails.episodes[episode - 1].name}
                        className="w-full h-40 object-cover rounded-lg mt-4"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Content Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1f1f1f] p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center">
                  <FaFilm className="w-5 h-5 mr-2" />
                  Production Details
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Status:</span> {content.status}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Budget:</span> ${content.budget?.toLocaleString()}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Revenue:</span> ${content.revenue?.toLocaleString()}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Production:</span> {content.production_companies?.map(c => c.name).join(', ')}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Countries:</span> {content.production_countries?.map(c => c.name).join(', ')}
                  </p>
                </div>
              </div>

              <div className="bg-[#1f1f1f] p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center">
                  <FaUserFriends className="w-5 h-5 mr-2" />
                  Cast & Crew
                </h3>
                <div className="space-y-4">
                  {director && (
                    <div className="text-sm">
                      <span className="text-white font-medium">Director:</span>
                      <span className="text-gray-400 ml-2">{director.name}</span>
                    </div>
                  )}
                  {writers?.length > 0 && (
                    <div className="text-sm">
                      <span className="text-white font-medium">Writers:</span>
                      <span className="text-gray-400 ml-2">{writers.map(w => w.name).join(', ')}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {content.credits?.cast?.slice(0, 6).map(actor => (
                      <div key={actor.id} className="flex items-center space-x-2">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`}
                            alt={actor.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <FaUserTie className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{actor.name}</p>
                          <p className="text-gray-400 text-xs">{actor.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#1f1f1f] p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center">
                  <FaTags className="w-5 h-5 mr-2" />
                  Genres & Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {content.genres?.map(genre => (
                    <span key={genre.id} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                  {content.keywords?.keywords?.slice(0, 5).map(keyword => (
                    <span key={keyword.id} className="px-3 py-1 bg-black text-white rounded-full text-sm border border-white/20">
                      {keyword.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#1f1f1f] p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center">
                  <FaGlobeAmericas className="w-5 h-5 mr-2" />
                  Languages & Release
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Original Language:</span> {content.original_language?.toUpperCase()}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Spoken Languages:</span> {content.spoken_languages?.map(l => l.english_name).join(', ')}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Release Date:</span> {content.release_date || content.first_air_date}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Popularity Score:</span> {content.popularity?.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#1f1f1f] p-4 rounded-xl border border-white/10 flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FaClosedCaptioning className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Subtitles</p>
                  <p className="text-gray-400 text-sm">Multiple Languages</p>
                </div>
              </div>
              <div className="bg-[#1f1f1f] p-4 rounded-xl border border-white/10 flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FaVolumeUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Audio</p>
                  <p className="text-gray-400 text-sm">Multi-Track</p>
                </div>
              </div>
              <div className="bg-[#1f1f1f] p-4 rounded-xl border border-white/10 flex items-center space-x-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FaVideo className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Quality</p>
                  <p className="text-gray-400 text-sm">Up to 4K HDR</p>
                </div>
              </div>
              <div className="bg-[#1f1f1f] p-4 rounded-xl border border-white/10 flex items-center space-x-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <FaAward className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Awards</p>
                  <p className="text-gray-400 text-sm">{content.vote_count} Votes</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-[#1f1f1f] p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-bold mb-4">You May Also Like</h3>
                <div className="grid grid-cols-6 gap-4">
                  {recommendations.slice(0, 6).map(item => (
                    <div 
                      key={item.id}
                      onClick={() => navigate(`/${type}/${item.id}`)}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FaPlay className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <p className="text-white text-sm mt-2 line-clamp-1">
                        {item.title || item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {content.poster_path && (
              <div className="sticky top-6">
                <div className="aspect-[2/3] relative rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
                    alt={content.title || content.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="mt-4 p-4 bg-[#1f1f1f] rounded-xl border border-white/10">
                  <p className="text-white text-sm leading-relaxed">
                    {content.overview}
                  </p>
                  {content.tagline && (
                    <p className="text-gray-400 text-sm mt-2 italic">
                      "{content.tagline}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
