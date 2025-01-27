import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [signupsRemaining, setSignupsRemaining] = useState(null);

  useEffect(() => {
    // Check remaining signups on component mount
    checkRemainingSignups();
  }, []);

  const checkRemainingSignups = async () => {
    try {
      const statsRef = doc(db, 'system', 'signupStats');
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        const { lastReset, count } = statsDoc.data();
        const now = new Date();
        const resetTime = lastReset.toDate();
        const hoursSinceReset = (now - resetTime) / (1000 * 60 * 60);

        if (hoursSinceReset >= 25) {
          // Reset counter if 25 hours have passed
          await setDoc(statsRef, {
            lastReset: now,
            count: 0
          });
          setSignupsRemaining(25);
        } else {
          setSignupsRemaining(25 - count);
        }
      } else {
        // Initialize stats if they don't exist
        await setDoc(statsRef, {
          lastReset: new Date(),
          count: 0
        });
        setSignupsRemaining(25);
      }
    } catch (error) {
      console.error('Error checking signup stats:', error);
      setError('Unable to check signup availability');
    }
  };

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      // Check if signups are available
      if (signupsRemaining <= 0) {
        throw new Error('No signups available. Please try again in 25 hours.');
      }

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

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update signup counter
      const statsRef = doc(db, 'system', 'signupStats');
      const statsDoc = await getDoc(statsRef);
      if (statsDoc.exists()) {
        const { count } = statsDoc.data();
        await setDoc(statsRef, {
          lastReset: statsDoc.data().lastReset,
          count: count + 1
        });
      }

      // Store user data in Firestore
      const userData = {
        username,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 0,
        banned: false
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

  if (signupsRemaining === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 max-w-md w-full">
          <div className="text-center mb-6">
            <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Signups Temporarily Closed</h2>
            <p className="text-gray-400 mt-2">
              We've reached our daily signup limit. Please try again in 25 hours.
            </p>
          </div>
          <Link
            to="/"
            className="block w-full text-center bg-white text-black rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

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
            <p className="mt-2 text-gray-400">
              {signupsRemaining} slots remaining today
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-red-500 font-semibold mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Important Notice
            </h3>
            <p className="text-red-400 text-sm">
              Make sure you're using either Gmail, Proton, or Outlook email.
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
