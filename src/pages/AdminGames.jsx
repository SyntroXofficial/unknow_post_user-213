import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGamepad, FaPlus, FaEdit, FaTrash, FaArrowLeft,
  FaSave, FaTimes, FaImage, FaList, FaServer,
  FaFileImport, FaSpinner
} from 'react-icons/fa';
import { db } from '../firebase';
import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { allGames } from '../data/gameAccounts';

function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [newGame, setNewGame] = useState({
    game: '',
    username: '',
    password: '',
    imageUrl: '',
    description: '',
    features: [
      { label: 'Rating', value: '' },
      { label: 'Platform', value: '' },
      { label: 'Release', value: '' },
      { label: 'Genre', value: '' },
      { label: 'Playtime', value: '' }
    ],
    requirements: {
      cpu: '',
      gpu: '',
      ram: '',
      storage: ''
    }
  });

  useEffect(() => {
    const gamesQuery = query(collection(db, 'games'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(gamesQuery, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGames(gamesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleImportGames = async () => {
    if (importing) return;
    
    try {
      setImporting(true);
      const batch = writeBatch(db);
      const gamesRef = collection(db, 'games');

      // First, get existing games to avoid duplicates
      const existingGames = new Set(games.map(g => g.game.toLowerCase()));

      let importCount = 0;
      for (const game of allGames) {
        // Skip if game already exists
        if (existingGames.has(game.game.toLowerCase())) {
          continue;
        }

        const gameDoc = doc(gamesRef);
        batch.set(gameDoc, {
          ...game,
          createdAt: serverTimestamp()
        });
        importCount++;

        // Firestore batches are limited to 500 operations
        if (importCount >= 500) {
          await batch.commit();
          const newBatch = writeBatch(db);
          batch = newBatch;
          importCount = 0;
        }
      }

      if (importCount > 0) {
        await batch.commit();
      }

      alert('Games imported successfully!');
    } catch (error) {
      console.error('Error importing games:', error);
      alert('Error importing games. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleAddGame = async () => {
    try {
      await addDoc(collection(db, 'games'), {
        ...newGame,
        createdAt: serverTimestamp()
      });
      setShowGameForm(false);
      resetForm();
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const handleEditGame = async () => {
    if (!editingGame) return;
    
    try {
      const gameRef = doc(db, 'games', editingGame.id);
      await updateDoc(gameRef, {
        ...newGame,
        updatedAt: serverTimestamp()
      });
      setEditingGame(null);
      setShowGameForm(false);
      resetForm();
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    try {
      await deleteDoc(doc(db, 'games', gameId));
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const resetForm = () => {
    setNewGame({
      game: '',
      username: '',
      password: '',
      imageUrl: '',
      description: '',
      features: [
        { label: 'Rating', value: '' },
        { label: 'Platform', value: '' },
        { label: 'Release', value: '' },
        { label: 'Genre', value: '' },
        { label: 'Playtime', value: '' }
      ],
      requirements: {
        cpu: '',
        gpu: '',
        ram: '',
        storage: ''
      }
    });
  };

  const filteredGames = games.filter(game => 
    game.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black pt-24 px-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Games Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleImportGames}
            disabled={importing}
            className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 ${
              importing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {importing ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaFileImport className="w-4 h-4" />
            )}
            <span>{importing ? 'Importing...' : 'Import All Games'}</span>
          </button>
          <button
            onClick={() => {
              setEditingGame(null);
              setShowGameForm(true);
              resetForm();
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add New Game</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search games..."
          className="w-full bg-white/5 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
        />
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map(game => (
          <div
            key={game.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={game.imageUrl}
                alt={game.game}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{game.game}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <FaServer className="w-4 h-4" />
                  <span>{game.username}</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingGame(game);
                  setNewGame(game);
                  setShowGameForm(true);
                }}
                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
              >
                <FaEdit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteGame(game.id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Game Form Modal */}
      {showGameForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1B] p-8 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h3>
              <button
                onClick={() => {
                  setShowGameForm(false);
                  setEditingGame(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingGame) {
                handleEditGame();
              } else {
                handleAddGame();
              }
            }} className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={newGame.game}
                  onChange={(e) => setNewGame({...newGame, game: e.target.value})}
                  placeholder="Game Title"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  required
                />
                
                <input
                  type="text"
                  value={newGame.username}
                  onChange={(e) => setNewGame({...newGame, username: e.target.value})}
                  placeholder="Username"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  required
                />

                <input
                  type="text"
                  value={newGame.password}
                  onChange={(e) => setNewGame({...newGame, password: e.target.value})}
                  placeholder="Password"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  required
                />

                <input
                  type="url"
                  value={newGame.imageUrl}
                  onChange={(e) => setNewGame({...newGame, imageUrl: e.target.value})}
                  placeholder="Image URL"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  required
                />

                <textarea
                  value={newGame.description}
                  onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                  placeholder="Description"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 min-h-[100px]"
                  required
                />

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold">Features</h4>
                  {newGame.features.map((feature, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={feature.label}
                        onChange={(e) => {
                          const updatedFeatures = [...newGame.features];
                          updatedFeatures[index].label = e.target.value;
                          setNewGame({...newGame, features: updatedFeatures});
                        }}
                        placeholder="Feature Label"
                        className="bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                      />
                      <input
                        type="text"
                        value={feature.value}
                        onChange={(e) => {
                          const updatedFeatures = [...newGame.features];
                          updatedFeatures[index].value = e.target.value;
                          setNewGame({...newGame, features: updatedFeatures});
                        }}
                        placeholder="Feature Value"
                        className="bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                      />
                    </div>
                  ))}
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold">System Requirements</h4>
                  <input
                    type="text"
                    value={newGame.requirements.cpu}
                    onChange={(e) => setNewGame({
                      ...newGame,
                      requirements: {...newGame.requirements, cpu: e.target.value}
                    })}
                    placeholder="CPU Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                  <input
                    type="text"
                    value={newGame.requirements.gpu}
                    onChange={(e) => setNewGame({
                      ...newGame,
                      requirements: {...newGame.requirements, gpu: e.target.value}
                    })}
                    placeholder="GPU Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                  <input
                    type="text"
                    value={newGame.requirements.ram}
                    onChange={(e) => setNewGame({
                      ...newGame,
                      requirements: {...newGame.requirements, ram: e.target.value}
                    })}
                    placeholder="RAM Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                  <input
                    type="text"
                    value={newGame.requirements.storage}
                    onChange={(e) => setNewGame({
                      ...newGame,
                      requirements: {...newGame.requirements, storage: e.target.value}
                    })}
                    placeholder="Storage Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGameForm(false);
                    setEditingGame(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  {editingGame ? 'Update Game' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGames;