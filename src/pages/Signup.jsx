import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateEmail = (email) => {
    const allowedDomains = ['gmail.com', 'proton.me', 'outlook.com'];
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Email check error:', error);
      throw new Error('Failed to check email. Please try again.');
    }
  };

  const checkIPExists = async (ip) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('registrationIP', '==', ip));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('IP check error:', error);
      throw new Error('Failed to check IP. Please try again.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      // Basic validation
      if (!username || !email || !password) {
        throw new Error('All fields are required');
      }

      // Validate email domain
      if (!validateEmail(email)) {
        throw new Error('Only Gmail, Proton, and Outlook emails are allowed');
      }

      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        throw new Error('This email is already registered');
      }

      // Get user's IP address
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      const userIP = ipData.ip;

      // Check if IP already exists
      const ipExists = await checkIPExists(userIP);
      if (ipExists) {
        throw new Error('An account already exists from this IP address');
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Store user data in Firestore
      const userData = {
        username,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 0,
        banned: false,
        registrationIP: userIP,
        registrationCountry: ipData.country_name,
        registrationCity: ipData.city,
        registrationISP: ipData.org
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setIsValidating(false);
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
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-red-500 font-semibold mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Important Notice
            </h3>
            <p className="text-red-400 text-sm">
              Only one account per IP address is allowed. Make sure you're using either Gmail, Proton, or Outlook email.
              Providing incorrect information will result in an immediate permanent ban.
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
              disabled={isValidating}
              className={`w-full bg-white text-black rounded-lg py-3 font-semibold transition-colors ${
                isValidating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
              }`}
            >
              {isValidating ? 'Validating...' : 'Create Account'}
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
