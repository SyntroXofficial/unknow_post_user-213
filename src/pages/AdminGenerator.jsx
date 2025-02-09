import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGamepad, FaPlus, FaEdit, FaTrash, FaArrowLeft,
  FaSave, FaTimes, FaImage, FaList, FaServer,
  FaUserShield, FaSignInAlt, FaKey, FaCookie
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

function AdminGenerator() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  // Initialize newService with default values
  const defaultService = {
    name: '',
    description: '',
    imageUrl: '',
    inStock: 1,
    isCookie: false,
    megaUrl: '',
    accounts: [],
    features: [
      { label: 'Type', value: '' },
      { label: 'Duration', value: '' },
      { label: 'Region', value: '' },
      { label: 'Quality', value: '' }
    ],
    requirements: {
      device: '',
      browser: '',
      connection: '',
      storage: ''
    }
  };

  const [newService, setNewService] = useState(defaultService);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminId === '724819305684937' && adminPassword === 'tRXV[1P5=O:9') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const servicesQuery = query(collection(db, 'generator_services'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure features array exists for each service
        return {
          id: doc.id,
          ...data,
          features: data.features || [
            { label: 'Type', value: data.isCookie ? 'Cookie Auth' : 'Direct Login' },
            { label: 'Duration', value: 'Unlimited' },
            { label: 'Region', value: 'Global' },
            { label: 'Quality', value: 'Premium' }
          ],
          requirements: data.requirements || {
            device: 'Any modern device',
            browser: 'Chrome, Firefox, or Edge',
            connection: 'Stable internet connection',
            storage: 'No additional storage required'
          }
        };
      });
      setServices(servicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleAddService = async () => {
    try {
      await addDoc(collection(db, 'generator_services'), {
        ...newService,
        createdAt: serverTimestamp()
      });
      setShowServiceForm(false);
      resetForm();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleEditService = async () => {
    if (!editingService) return;
    
    try {
      const serviceRef = doc(db, 'generator_services', editingService.id);
      await updateDoc(serviceRef, {
        ...newService,
        updatedAt: serverTimestamp()
      });
      setEditingService(null);
      setShowServiceForm(false);
      resetForm();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await deleteDoc(doc(db, 'generator_services', serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const resetForm = () => {
    setNewService(defaultService);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <FaUserShield className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white">Admin Access</h2>
              <p className="mt-2 text-gray-400">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="text-white text-sm font-medium block mb-2">Admin ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                  placeholder="Enter admin ID"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium block mb-2">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white text-black rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <FaSignInAlt className="mr-2" />
                Access Dashboard
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading services...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Generator Services Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setEditingService(null);
              setShowServiceForm(true);
              resetForm();
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services..."
          className="w-full bg-white/5 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={service.imageUrl}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{service.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  {service.isCookie ? (
                    <FaCookie className="w-4 h-4" />
                  ) : (
                    <FaKey className="w-4 h-4" />
                  )}
                  <span>{service.isCookie ? 'Cookie Auth' : 'Direct Login'}</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingService(service);
                  setNewService(service);
                  setShowServiceForm(true);
                }}
                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
              >
                <FaEdit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteService(service.id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Service Form Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1B] p-8 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => {
                  setShowServiceForm(false);
                  setEditingService(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingService) {
                handleEditService();
              } else {
                handleAddService();
              }
            }} className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="Service Name"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  required
                />
                
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Description"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 min-h-[100px]"
                  required
                />

                <input
                  type="url"
                  value={newService.imageUrl}
                  onChange={(e) => setNewService({...newService, imageUrl: e.target.value})}
                  placeholder="Image URL"
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  required
                />

                <div className="flex items-center space-x-4">
                  <label className="text-white flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newService.isCookie}
                      onChange={(e) => setNewService({...newService, isCookie: e.target.checked})}
                      className="rounded border-white/20"
                    />
                    <span>Requires Cookie</span>
                  </label>

                  {newService.isCookie && (
                    <input
                      type="url"
                      value={newService.megaUrl}
                      onChange={(e) => setNewService({...newService, megaUrl: e.target.value})}
                      placeholder="MEGA URL for Cookie"
                      className="flex-1 bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                    />
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold">Features</h4>
                  {newService.features.map((feature, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={feature.label}
                        onChange={(e) => {
                          const updatedFeatures = [...newService.features];
                          updatedFeatures[index].label = e.target.value;
                          setNewService({...newService, features: updatedFeatures});
                        }}
                        placeholder="Feature Label"
                        className="bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                      />
                      <input
                        type="text"
                        value={feature.value}
                        onChange={(e) => {
                          const updatedFeatures = [...newService.features];
                          updatedFeatures[index].value = e.target.value;
                          setNewService({...newService, features: updatedFeatures});
                        }}
                        placeholder="Feature Value"
                        className="bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                      />
                    </div>
                  ))}
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold">Requirements</h4>
                  <input
                    type="text"
                    value={newService.requirements.device}
                    onChange={(e) => setNewService({
                      ...newService,
                      requirements: {...newService.requirements, device: e.target.value}
                    })}
                    placeholder="Device Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                  <input
                    type="text"
                    value={newService.requirements.browser}
                    onChange={(e) => setNewService({
                      ...newService,
                      requirements: {...newService.requirements, browser: e.target.value}
                    })}
                    placeholder="Browser Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                  <input
                    type="text"
                    value={newService.requirements.connection}
                    onChange={(e) => setNewService({
                      ...newService,
                      requirements: {...newService.requirements, connection: e.target.value}
                    })}
                    placeholder="Connection Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                  <input
                    type="text"
                    value={newService.requirements.storage}
                    onChange={(e) => setNewService({
                      ...newService,
                      requirements: {...newService.requirements, storage: e.target.value}
                    })}
                    placeholder="Storage Requirements"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  />
                </div>

                {/* Accounts */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold">Accounts</h4>
                  <textarea
                    value={newService.accounts.join('\n')}
                    onChange={(e) => setNewService({
                      ...newService,
                      accounts: e.target.value.split('\n').filter(account => account.trim())
                    })}
                    placeholder="Enter accounts (one per line)"
                    className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceForm(false);
                    setEditingService(null);
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
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGenerator;