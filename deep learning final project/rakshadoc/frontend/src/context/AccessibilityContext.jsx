import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal', 'large', 'xlarge'

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleScreenReader = () => setScreenReaderActive(prev => !prev);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      toggleHighContrast,
      screenReaderActive,
      toggleScreenReader,
      fontSize,
      setFontSize,
      speakText
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
