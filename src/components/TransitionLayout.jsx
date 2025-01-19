import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TransitionLayout = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="fixed inset-0 bg-black pointer-events-none z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
    </div>
  );
};

export default TransitionLayout;