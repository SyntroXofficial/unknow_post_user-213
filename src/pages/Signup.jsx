import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDiscord, FaEnvelope, FaLock, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [discordId, setDiscordId] = useState('');
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

  const validateDiscordId = async (id) => {
    try {
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'bf35cf1718msh1c6292a61e1a78cp138de3jsnb78afd54c5d0',
          'x-rapidapi-host': 'discord-lookup.p.rapidapi.com'
        }
      };

      const response = await fetch(`https://discord-lookup.p.rapidapi.com/user/${id}`, options);
      
      if (!response.ok) {
        console.error('Discord API Error:', response.status);
        throw new Error('Failed to validate Discord ID');
      }

      const data = await response.json();
      console.log('Discord API Response:', data);
      
      if (data.error || !data.username) {
        console.error('Invalid Discord data:', data);
        throw new Error('Invalid Discord ID');
      }
      
      return {
        discordUsername: data.username || 'Unknown',
        discordDiscriminator: data.discriminator || '0000',
        discordAvatar: data.avatar || null,
        discordBanner: data.banner || null,
        discordBannerColor: data.banner_color || null,
        discordCreatedAt: data.created_at || new Date().toISOString(),
        discordPublicFlags: data.public_flags || 0,
        discordBadges: data.badges || []
      };
    } catch (error) {
      console.error('Discord validation error:', error);
      throw new Error('Failed to validate Discord ID. Please try again.');
    }
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
      if (!username || !discordId || !email || !password) {
        throw new Error('All fields are required');
      }

      if (discordId.length !== 18 || !/^\d+$/.test(discordId)) {
        throw new Error('Discord ID must be exactly 18 numbers');
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

      // Validate Discord ID and get user details
      console.log('Starting Discord validation...');
      const discordDetails = await validateDiscordId(discordId);
      console.log('Discord details:', discordDetails);

      // Create Firebase auth user
      console.log('Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase user created:', userCredential.user.uid);

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

      // Store additional user data in Firestore
      const userData = {
        username,
        discordId,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 0,
        banned: false,
        ...discordDetails
      };

      console.log('Storing user data:', userData);
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('User data stored successfully');

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
                  onChange={(e) => setDiscordId(e.target.value.replace(/\D/g, '').slice(0, 18))}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                  placeholder="Enter your 18-digit Discord ID"
                  required
                  pattern="\d{18}"
                  title="Discord ID must be exactly 18 numbers"
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