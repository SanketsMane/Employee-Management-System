import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AICharacter = ({ 
  type = 'assistant',
  animation = 'idle',
  size = 'medium',
  position = 'center',
  showSpeechBubble = false,
  speechText = '',
  onAnimationComplete,
  className = '',
  autoAnimate = true,
  interactive = true
}) => {
  const [currentAnimation, setCurrentAnimation] = useState(animation);
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(showSpeechBubble);
  const characterRef = useRef(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Character animations based on type
  const characterVariants = {
    idle: {
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    wave: {
      rotate: [0, 15, -15, 15, -15, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        ease: "easeInOut"
      }
    },
    thinking: {
      rotate: [0, 5, -5, 0],
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    excited: {
      y: [0, -20, 0, -10, 0],
      scale: [1, 1.2, 1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    },
    talking: {
      scale: [1, 1.05, 1, 1.05, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    celebrate: {
      y: [0, -30, 0, -15, 0],
      rotate: [0, 360],
      scale: [1, 1.3, 1],
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  // Speech bubble animations
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Size configurations
  const sizeConfig = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 160, height: 160 },
    xl: { width: 200, height: 200 }
  };

  // Character designs based on type
  const getCharacterDesign = () => {
    const { width, height } = sizeConfig[size];
    
    switch (type) {
      case 'assistant':
        return (
          <div className="relative">
            {/* AI Assistant Character */}
            <div 
              className={`relative bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 rounded-full shadow-2xl ${interactive ? 'cursor-pointer' : ''}`}
              style={{ width, height }}
            >
              {/* Character Face */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Eyes */}
                <div className="flex space-x-3">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-blue-900 rounded-full ml-0.5 mt-0.5"></div>
                  </div>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-blue-900 rounded-full ml-0.5 mt-0.5"></div>
                  </div>
                </div>
              </div>
              
              {/* Glowing Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 opacity-50 animate-ping"></div>
              
              {/* Tech Lines */}
              <div className="absolute inset-2 rounded-full border border-blue-200 opacity-30"></div>
              <div className="absolute inset-4 rounded-full border border-blue-100 opacity-20"></div>
            </div>
          </div>
        );
        
      case 'robot':
        return (
          <div className="relative">
            {/* Robot Character */}
            <div 
              className={`relative bg-gradient-to-br from-gray-400 via-blue-500 to-gray-600 rounded-lg shadow-2xl ${interactive ? 'cursor-pointer' : ''}`}
              style={{ width, height }}
            >
              {/* Robot Head */}
              <div className="absolute inset-2 bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg">
                {/* Eyes */}
                <div className="absolute top-4 left-0 right-0 flex justify-center space-x-2">
                  <div className="w-4 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-4 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                
                {/* Mouth */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="w-6 h-1 bg-cyan-300 rounded-full"></div>
                </div>
              </div>
              
              {/* Antenna */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-4 bg-gray-600"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );
        
      case 'guide':
        return (
          <div className="relative">
            {/* Guide Character */}
            <div 
              className={`relative bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full shadow-2xl ${interactive ? 'cursor-pointer' : ''}`}
              style={{ width, height }}
            >
              {/* Character Face */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Eyes */}
                <div className="flex space-x-3">
                  <div className="w-3 h-3 bg-white rounded-full">
                    <div className="w-2 h-2 bg-green-900 rounded-full ml-0.5 mt-0.5"></div>
                  </div>
                  <div className="w-3 h-3 bg-white rounded-full">
                    <div className="w-2 h-2 bg-green-900 rounded-full ml-0.5 mt-0.5"></div>
                  </div>
                </div>
              </div>
              
              {/* Smile */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-2 border-b-2 border-white rounded-full"></div>
              </div>
              
              {/* Helper Badge */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">!</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return getCharacterDesign();
    }
  };

  // Auto-animate when in view
  useEffect(() => {
    if (autoAnimate && inView) {
      const animations = ['idle', 'thinking', 'wave'];
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      setCurrentAnimation(randomAnimation);
    }
  }, [inView, autoAnimate]);

  // Handle interactions
  const handleClick = () => {
    if (!interactive) return;
    
    const interactionAnimations = ['wave', 'excited', 'celebrate'];
    const randomAnimation = interactionAnimations[Math.floor(Math.random() * interactionAnimations.length)];
    setCurrentAnimation(randomAnimation);
    
    if (speechText) {
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 3000);
    }
  };

  const handleHover = () => {
    if (!interactive) return;
    setIsHovered(true);
    setCurrentAnimation('thinking');
  };

  const handleHoverEnd = () => {
    if (!interactive) return;
    setIsHovered(false);
    setCurrentAnimation('idle');
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        ref={characterRef}
        variants={characterVariants}
        animate={currentAnimation}
        whileHover={interactive ? { scale: 1.1 } : {}}
        onClick={handleClick}
        onHoverStart={handleHover}
        onHoverEnd={handleHoverEnd}
        onAnimationComplete={onAnimationComplete}
        className={`relative z-10 ${position === 'floating' ? 'absolute' : ''}`}
      >
        {getCharacterDesign()}
      </motion.div>

      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && speechText && (
          <motion.div
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
              <p className="text-sm text-gray-800 dark:text-gray-200">{speechText}</p>
              {/* Speech bubble arrow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Particles Effect */}
      {type === 'assistant' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              animate={{
                x: [0, 20, -20, 0],
                y: [0, -30, -10, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                left: `${30 + i * 20}%`,
                top: `${20 + i * 10}%`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AICharacter;
