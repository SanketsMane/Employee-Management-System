import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AICharacter from './AICharacter';

const InteractiveElements = () => {
  const [floatingElements, setFloatingElements] = useState([]);
  const [showParticles, setShowParticles] = useState(true);

  useEffect(() => {
    // Generate floating elements
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      color: ['blue', 'purple', 'cyan', 'pink'][Math.floor(Math.random() * 4)],
      duration: Math.random() * 10 + 10
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Particles */}
      <AnimatePresence>
        {showParticles && floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className={`absolute rounded-full bg-${element.color}-400 opacity-20`}
            style={{
              width: element.size,
              height: element.size,
              left: element.x,
              top: element.y
            }}
            animate={{
              y: [element.y, element.y - 100, element.y],
              x: [element.x, element.x + 50, element.x - 50, element.x],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </AnimatePresence>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full opacity-10 animate-pulse"></div>
    </div>
  );
};

const LoadingCharacter = ({ message = "Loading...", size = "large" }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <AICharacter
        type="assistant"
        animation="thinking"
        size={size}
        showSpeechBubble={true}
        speechText={message}
        autoAnimate={true}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );
};

const SuccessCharacter = ({ message = "Success!", onComplete }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="flex flex-col items-center justify-center space-y-4"
    >
      <AICharacter
        type="guide"
        animation="celebrate"
        size="large"
        showSpeechBubble={true}
        speechText={message}
        onAnimationComplete={onComplete}
      />
      {/* Confetti Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 100],
              x: [0, Math.random() * 200 - 100],
              rotate: [0, 360],
              opacity: [1, 0]
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const ErrorCharacter = ({ message = "Oops! Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <AICharacter
        type="robot"
        animation="thinking"
        size="large"
        showSpeechBubble={true}
        speechText={message}
      />
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </motion.button>
      )}
    </div>
  );
};

const EmptyStateCharacter = ({ 
  title = "Nothing here yet!",
  message = "Ready to get started?",
  actionText = "Create Something",
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <AICharacter
        type="guide"
        animation="idle"
        size="xl"
        showSpeechBubble={true}
        speechText={message}
      />
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
      </div>
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {actionText}
        </motion.button>
      )}
    </div>
  );
};

const NotificationCharacter = ({ 
  type = 'info',
  message,
  onDismiss,
  autoHide = true,
  duration = 5000
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  const getCharacterType = () => {
    switch (type) {
      case 'success': return 'guide';
      case 'error': return 'robot';
      case 'warning': return 'assistant';
      default: return 'assistant';
    }
  };

  const getAnimation = () => {
    switch (type) {
      case 'success': return 'celebrate';
      case 'error': return 'thinking';
      case 'warning': return 'wave';
      default: return 'talking';
    }
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm"
    >
      <div className="flex items-start space-x-3">
        <AICharacter
          type={getCharacterType()}
          animation={getAnimation()}
          size="small"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
          {onDismiss && (
            <button
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FloatingAssistant = ({ 
  position = 'bottom-right',
  onHelp,
  scenarios = ['help', 'tips', 'dashboard']
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(scenarios[0]);

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6'
  };

  const cycleScenario = () => {
    const currentIndex = scenarios.indexOf(currentScenario);
    const nextIndex = (currentIndex + 1) % scenarios.length;
    setCurrentScenario(scenarios[nextIndex]);
  };

  return (
    <div className={`${positionClasses[position]} z-40`}>
      <motion.div
        animate={{ 
          scale: isExpanded ? 1.1 : 1,
          rotate: isExpanded ? 5 : 0
        }}
        className="relative"
      >
        <div 
          className="cursor-pointer"
          onClick={() => {
            setIsExpanded(!isExpanded);
            cycleScenario();
            if (onHelp) onHelp();
          }}
        >
          <AICharacter
            type="assistant"
            animation={isExpanded ? "excited" : "idle"}
            size="large"
            showSpeechBubble={isExpanded}
            speechText={isExpanded ? "How can I help you?" : ""}
            interactive={true}
          />
        </div>

        {/* Floating Menu */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-48"
            >
              <div className="space-y-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
                  onClick={() => console.log('Help clicked')}
                >
                  🆘 Get Help
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
                  onClick={() => console.log('Tips clicked')}
                >
                  💡 Show Tips
                </button>
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
                  onClick={() => console.log('Tour clicked')}
                >
                  🎯 Take Tour
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export {
  InteractiveElements,
  LoadingCharacter,
  SuccessCharacter,
  ErrorCharacter,
  EmptyStateCharacter,
  NotificationCharacter,
  FloatingAssistant
};
