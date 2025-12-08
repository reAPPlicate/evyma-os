import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

/**
 * PageTransition - Global page transition wrapper with bottom-up animation
 * Matches design language: drawers from top, pages from bottom
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Show loading on route change
    setIsTransitioning(true);
    
    // Hide after brief delay to allow content to prepare
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Loading Spinner Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none"
          >
            <LoadingSpinner size="lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content with Bottom-Up Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.25,
            ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth feel
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}