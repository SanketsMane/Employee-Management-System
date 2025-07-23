import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AICharacter from './AICharacter';

const FormonexAI = ({ 
  scenario = 'welcome',
  userName = 'User',
  onInteraction,
  size = 'medium',
  showTips = true 
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [showMessage, setShowMessage] = useState(false);

  // Formonex-specific scenarios and messages
  const scenarios = {
    welcome: {
      messages: [
        `Welcome to Formonex, ${userName}! 👋`,
        `Ready to boost your productivity today?`,
        `I'm here to help you navigate the system!`
      ],
      animation: 'wave'
    },
    dashboard: {
      messages: [
        `Your dashboard is looking great today!`,
        `You have new updates waiting for you`,
        `Let's check your progress together!`
      ],
      animation: 'excited'
    },
    tasks: {
      messages: [
        `Time to tackle those tasks! 💪`,
        `You're doing amazing work!`,
        `Need help organizing your tasks?`
      ],
      animation: 'thinking'
    },
    learning: {
      messages: [
        `Learning never stops at Formonex! 📚`,
        `Discover new skills today!`,
        `Your growth journey continues!`
      ],
      animation: 'celebrate'
    },
    achievement: {
      messages: [
        `Congratulations on your achievement! 🎉`,
        `You're crushing your goals!`,
        `Formonex is proud of your progress!`
      ],
      animation: 'celebrate'
    },
    help: {
      messages: [
        `Need assistance? I'm here to help!`,
        `Let me guide you through this`,
        `Formonex support is always available`
      ],
      animation: 'thinking'
    },
    empty_state: {
      messages: [
        `Nothing here yet, but that's okay!`,
        `Ready to get started?`,
        `Let's create something amazing!`
      ],
      animation: 'idle'
    },
    error: {
      messages: [
        `Oops! Something went wrong`,
        `Don't worry, we'll fix this together`,
        `Try refreshing or contact support`
      ],
      animation: 'thinking'
    },
    success: {
      messages: [
        `Success! Well done! ✨`,
        `Mission accomplished!`,
        `You're on fire today!`
      ],
      animation: 'celebrate'
    },
    tips: {
      messages: [
        `💡 Tip: Use keyboard shortcuts to work faster!`,
        `💡 Tip: Check your notifications regularly`,
        `💡 Tip: Complete your profile for better experience`,
        `💡 Tip: Join team discussions to stay connected`,
        `💡 Tip: Set daily goals to track progress`
      ],
      animation: 'talking'
    }
  };

  // Tips for different sections
  const sectionTips = {
    dashboard: [
      "Use the quick actions for faster navigation",
      "Check your attendance regularly",
      "Review your recent activities"
    ],
    tasks: [
      "Prioritize tasks by due date",
      "Use filters to find specific tasks",
      "Mark tasks complete as you go"
    ],
    learning: [
      "Track your learning progress",
      "Complete courses to earn certificates",
      "Explore new skill areas"
    ],
    admin: [
      "Monitor team performance regularly",
      "Approve batch requests promptly",
      "Export reports for analysis"
    ]
  };

  useEffect(() => {
    const scenarioData = scenarios[scenario];
    if (scenarioData) {
      const randomMessage = scenarioData.messages[Math.floor(Math.random() * scenarioData.messages.length)];
      setCurrentMessage(randomMessage);
      setCurrentAnimation(scenarioData.animation);
      setShowMessage(true);

      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [scenario, userName]);

  // Show tips periodically
  useEffect(() => {
    if (showTips && scenario !== 'tips') {
      const tipInterval = setInterval(() => {
        const tipMessages = scenarios.tips.messages;
        const randomTip = tipMessages[Math.floor(Math.random() * tipMessages.length)];
        setCurrentMessage(randomTip);
        setCurrentAnimation('talking');
        setShowMessage(true);

        setTimeout(() => {
          setShowMessage(false);
        }, 4000);
      }, 30000); // Show tip every 30 seconds

      return () => clearInterval(tipInterval);
    }
  }, [showTips, scenario]);

  const handleCharacterClick = () => {
    const newScenario = scenarios[scenario];
    if (newScenario) {
      const randomMessage = newScenario.messages[Math.floor(Math.random() * newScenario.messages.length)];
      setCurrentMessage(randomMessage);
      setCurrentAnimation('excited');
      setShowMessage(true);

      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }

    if (onInteraction) {
      onInteraction(scenario);
    }
  };

  return (
    <div className="relative">
      {/* Formonex-branded AI Character */}
      <div className="relative">
        <AICharacter
          type="assistant"
          animation={currentAnimation}
          size={size}
          showSpeechBubble={showMessage}
          speechText={currentMessage}
          onClick={handleCharacterClick}
          className="drop-shadow-lg"
        />
        
        {/* Formonex Logo Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-xs font-bold">F</span>
        </motion.div>

        {/* Pulsing Ring for Active State */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full border-2 border-blue-400 -z-10"
        />
      </div>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-sm"
              onClick={() => {
                setCurrentMessage("How can I help you today?");
                setShowMessage(true);
              }}
            >
              ?
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center text-sm"
              onClick={() => {
                const tips = sectionTips[scenario] || sectionTips.dashboard;
                const randomTip = tips[Math.floor(Math.random() * tips.length)];
                setCurrentMessage(`💡 ${randomTip}`);
                setShowMessage(true);
              }}
            >
              💡
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Preset components for common scenarios
export const WelcomeFormonexAI = ({ userName, ...props }) => (
  <FormonexAI scenario="welcome" userName={userName} {...props} />
);

export const DashboardFormonexAI = ({ userName, ...props }) => (
  <FormonexAI scenario="dashboard" userName={userName} {...props} />
);

export const TasksFormonexAI = ({ userName, ...props }) => (
  <FormonexAI scenario="tasks" userName={userName} {...props} />
);

export const LearningFormonexAI = ({ userName, ...props }) => (
  <FormonexAI scenario="learning" userName={userName} {...props} />
);

export const EmptyStateFormonexAI = ({ message, ...props }) => (
  <FormonexAI scenario="empty_state" {...props} />
);

export const AchievementFormonexAI = ({ userName, ...props }) => (
  <FormonexAI scenario="achievement" userName={userName} {...props} />
);

export default FormonexAI;
