import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AICharacter from './animations/AICharacter';

const FormonexSplashScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCharacter, setShowCharacter] = useState(false);

  const steps = [
    'Initializing Formonex Systems...',
    'Loading AI Assistants...',
    'Setting up Your Workspace...',
    'Almost Ready!'
  ];

  useEffect(() => {
    // Show character after a short delay
    setTimeout(() => setShowCharacter(true), 500);

    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(onComplete, 1000);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(stepInterval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center text-white">
        {/* Formonex Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              FORMONEX
            </span>
          </div>
          <p className="text-xl text-blue-100">Employee Management System</p>
        </motion.div>

        {/* AI Character */}
        <AnimatePresence>
          {showCharacter && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <AICharacter
                type="assistant"
                animation="wave"
                size="xl"
                showSpeechBubble={true}
                speechText="Welcome to Formonex! Let's get started."
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-blue-100">
            {steps[currentStep]}
          </h2>

          {/* Progress Bar */}
          <div className="w-80 mx-auto bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-white to-blue-200"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8"
        >
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FormonexSplashScreen;
