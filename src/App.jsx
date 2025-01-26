import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Streaming from './pages/Streaming';
import Movie from './pages/Movie';
import TVShow from './pages/TVShow';
import Search from './pages/Search';
import Games from './pages/Games';
import GameDetails from './pages/GameDetails';
import Generator from './pages/Generator';
import GeneratorDetails from './pages/GeneratorDetails';
import Important from './pages/Important';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import PageTransition from './components/PageTransition';
import TransitionLayout from './components/TransitionLayout';
import { auth, db } from './firebase';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

function PrivateRoute({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // Check last login time
      const lastLoginTime = user.metadata.lastLoginAt;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastLoginTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60); // Convert to hours

      if (hoursDiff >= 24) {
        // Force logout if more than 24 hours have passed
        auth.signOut();
        navigate('/login', { 
          state: { 
            from: location,
            message: 'Your session has expired. Please log in again.' 
          } 
        });
      }
    }
  }, [user, navigate, location]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const location = useLocation();
  const user = auth.currentUser;
  const isAdmin = user?.email === 'andres_rios_xyz@outlook.com';

  if (!user || !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        try {
          // Get user's IP and location information using ipapi.co
          const ipResponse = await fetch('https://ipapi.co/json/');
          const ipData = await ipResponse.json();

          // Get user's browser and system information
          const browserInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          };

          // Parse browser information
          const getBrowserInfo = (ua) => {
            const browsers = {
              chrome: /chrome/i,
              safari: /safari/i,
              firefox: /firefox/i,
              opera: /opera/i,
              edge: /edge/i,
              ie: /msie|trident/i
            };

            for (const [browser, regex] of Object.entries(browsers)) {
              if (regex.test(ua)) return browser.charAt(0).toUpperCase() + browser.slice(1);
            }
            return 'Unknown';
          };

          const getOSInfo = (ua) => {
            const os = {
              windows: /windows/i,
              mac: /mac/i,
              linux: /linux/i,
              android: /android/i,
              ios: /iphone|ipad|ipod/i
            };

            for (const [name, regex] of Object.entries(os)) {
              if (regex.test(ua)) return name.charAt(0).toUpperCase() + name.slice(1);
            }
            return 'Unknown';
          };

          const getDeviceType = (ua) => {
            if (/mobile/i.test(ua)) return 'Mobile';
            if (/tablet/i.test(ua)) return 'Tablet';
            return 'Desktop';
          };

          // Update user's last active timestamp and system information
          await updateDoc(userRef, {
            lastActive: serverTimestamp(),
            lastBrowser: getBrowserInfo(browserInfo.userAgent),
            lastOS: getOSInfo(browserInfo.userAgent),
            lastDevice: getDeviceType(browserInfo.userAgent),
            lastResolution: browserInfo.screenResolution,
            lastLanguage: browserInfo.language,
            lastTimeZone: ipData.timezone || 'Unknown',
            lastCountry: ipData.country_name || 'Unknown',
            lastCity: ipData.city || 'Unknown',
            lastISP: ipData.org || 'Unknown',
            lastIpAddress: ipData.ip || 'Unknown',
            lastLoginCount: increment(1)
          });

          // Set up periodic updates while user is active
          const updateInterval = setInterval(async () => {
            await updateDoc(userRef, {
              lastActive: serverTimestamp()
            });
          }, 60000); // Update every minute

          return () => clearInterval(updateInterval);
        } catch (error) {
          console.error('Error updating user information:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className={`min-h-screen bg-black transition-all duration-300 ${isSidebarOpen ? 'pl-16' : ''}`}>
        <main className="relative">
          <AnimatedRoutes />
        </main>
        <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>
    </Router>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <TransitionLayout key={location.pathname}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageTransition>
              <Home />
            </PageTransition>
          } />
          <Route path="/login" element={
            <PageTransition>
              <Login />
            </PageTransition>
          } />
          <Route path="/signup" element={
            <PageTransition>
              <Signup />
            </PageTransition>
          } />
          <Route path="/streaming" element={
            <PageTransition>
              <PrivateRoute>
                <Streaming />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/games" element={
            <PageTransition>
              <PrivateRoute>
                <Games />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/game/:id" element={
            <PageTransition>
              <PrivateRoute>
                <GameDetails />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/generator" element={
            <PageTransition>
              <PrivateRoute>
                <Generator />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/generator/:id" element={
            <PageTransition>
              <PrivateRoute>
                <GeneratorDetails />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/important" element={
            <PageTransition>
              <Important />
            </PageTransition>
          } />
          <Route path="/movie/:id" element={
            <PageTransition>
              <PrivateRoute>
                <Movie />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/tv/:id" element={
            <PageTransition>
              <PrivateRoute>
                <TVShow />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/search" element={
            <PageTransition>
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            </PageTransition>
          } />
          <Route path="/admin" element={
            <PageTransition>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </PageTransition>
          } />
        </Routes>
      </TransitionLayout>
    </AnimatePresence>
  );
}

export default App;