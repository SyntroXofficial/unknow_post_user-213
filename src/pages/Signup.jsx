import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDiscord, FaEnvelope, FaLock, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const allowedDomains = ['gmail.com', 'proton.me', 'outlook.com'];
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  const validateDiscordId = (id) => {
    return /^\d{18}$/.test(id);
  };

  const checkEmailExists = async (email) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email domain
    if (!validateEmail(email)) {
      setError('Only Gmail, Proton, and Outlook emails are allowed.');
      return;
    }

    // Validate Discord ID
    if (!validateDiscordId(discordId)) {
      setError('Discord ID must be exactly 18 numbers.');
      return;
    }

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError('This email is already registered. Please use a different email.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        discordId,
        email,
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email.');
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="mt-2 text-gray-400">Join our community today</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-red-500 font-semibold mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Important Notice
            </h3>
            <p className="text-red-400 text-sm">
              Providing incorrect or fake information will result in an immediate permanent ban.
              Make sure your Discord ID is exactly 18 numbers and you're using either Gmail,
              Proton, or Outlook email.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium block mb-2">Username</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">Discord ID</label>
              <div className="relative">
                <FaDiscord className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                  placeholder="Enter your 18-digit Discord ID"
                  required
                  pattern="\d{18}"
                />
              </div>
              <p className="mt-1 text-gray-400 text-xs">Must be exactly 18 numbers</p>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <p className="mt-1 text-gray-400 text-xs">Only Gmail, Proton, or Outlook emails allowed</p>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                  placeholder="Choose a password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white text-black rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
