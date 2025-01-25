import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaKey, FaClock, FaGlobe, FaInfoCircle, FaCopy, FaDownload, FaCookie } from 'react-icons/fa';
import { accountLists } from '../data/generatorAccounts';

function GeneratorDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const foundService = Object.entries(accountLists).find(([key]) => key === id);
    if (foundService) {
      setService({ id: foundService[0], ...foundService[1] });
    }
  }, [id]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-2xl">Loading service details...</div>
      </div>
    );
  }

  const randomAccount = service.accounts[Math.floor(Math.random() * service.accounts.length)];

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
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Service Info */}
        <motion.div 
          className="absolute inset-0 flex items-end pb-32"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
            <div className="w-[500px] ml-16 space-y-6">
              <h1 className="text-5xl font-bold text-white">{service.name}</h1>

              <div className="flex items-center space-x-6">
                {service.isCookie && (
                  <span className="px-3 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full text-yellow-400 text-xs font-medium">
                    Cookie Required
                  </span>
                )}
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium">
                  PREMIUM SERVICE
                </span>
              </div>

              <p className="text-lg text-white/90">{service.description}</p>

              {/* Service Access */}
              <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white">Service Access</h3>
                <p className="text-white/90">
                  Click on the "Access Service" button to {service.isCookie ? 'download required cookies' : 'copy your MEGA link and paste it intro an new page'}.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                {service.isCookie && service.megaUrl ? (
                  <a
                    href={service.megaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-base font-semibold group w-full"
                  >
                    <FaDownload className="mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                    Access Service
                  </a>
                ) : (
                  <button
                    onClick={() => copyToClipboard(randomAccount)}
                    className="flex items-center justify-center px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-base font-semibold group w-full"
                  >
                    <FaKey className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Access Service
                  </button>
                )}
              </div>
            </div>
        </motion.div>
      </motion.div>

      {/* Additional Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        <motion.div 
          className="grid grid-cols-2 gap-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Service Information</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <FaGlobe className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Service Type</p>
                  <p className="text-white">{service.isCookie ? 'Cookie Authentication' : 'Direct Login'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaClock className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Account Duration</p>
                  <p className="text-white">5-10-20 Days The Account Can Work</p>
                </div>
              </div>
              {service.isCookie && (
                <div className="flex items-center space-x-4">
                  <FaCookie className="text-white w-6 h-6" />
                  <div>
                    <p className="text-gray-400">Cookie Download</p>
                    <p className="text-white">Required for Access</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Usage Guidelines</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start space-x-4">
                <FaInfoCircle className="text-white w-6 h-6 mt-1" />
                <div>
                  <p className="text-white">Important Instructions</p>
                  <ul className="text-gray-400 list-disc list-inside mt-2 space-y-2">
                    <li>Do not change account passwords</li>
                    <li>Do not share account credentials</li>
                    <li>Use one account at a time</li>
                    <li>Report any issues immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Copy Notification */}
      <div
        className={`fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg transform transition-all duration-300 ${
          copied ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        Copied to clipboard!
      </div>
    </div>
  );
}

export default GeneratorDetails;