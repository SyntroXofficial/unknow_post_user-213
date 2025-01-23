import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Streaming from './pages/Streaming';
import Movie from './pages/Movie';
import TVShow from './pages/TVShow';
import Search from './pages/Search';
import Games from './pages/Games';
import GameDetails from './pages/GameDetails';
import Important from './pages/Important';
import Generator from './pages/Generator';
import PageTransition from './components/PageTransition';
import TransitionLayout from './components/TransitionLayout';

function AnimatedRoutes({ isSidebarOpen }) {
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
          <Route path="/streaming" element={
            <PageTransition>
              <Streaming />
            </PageTransition>
          } />
          <Route path="/games" element={
            <PageTransition>
              <Games />
            </PageTransition>
          } />
          <Route path="/game/:id" element={
            <PageTransition>
              <GameDetails />
            </PageTransition>
          } />
          <Route path="/generator" element={
            <PageTransition>
              <Generator />
            </PageTransition>
          } />
          <Route path="/important" element={
            <PageTransition>
              <Important />
            </PageTransition>
          } />
          <Route path="/movie/:id" element={
            <PageTransition>
              <Movie />
            </PageTransition>
          } />
          <Route path="/tv/:id" element={
            <PageTransition>
              <TVShow />
            </PageTransition>
          } />
          <Route path="/search" element={
            <PageTransition>
              <Search />
            </PageTransition>
          } />
        </Routes>
      </TransitionLayout>
    </AnimatePresence>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-black flex">
        <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-[280px]' : 'md:ml-16'}`}>
          <AnimatedRoutes isSidebarOpen={isSidebarOpen} />
        </main>
      </div>
    </Router>
  );
}

export default App;