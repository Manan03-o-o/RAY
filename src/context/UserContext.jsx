import React, { createContext, useEffect, useState, useCallback } from 'react';
import run from '../gemini';

export const datacontext = createContext();

function UserContext({ children }) {
  const [voices, setVoices] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Improved speak function
  const speak = useCallback((text) => {
    if (!voices.length) {
      console.warn('No voices available');
      return Promise.reject('No voices available');
    }

    return new Promise((resolve) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find a female voice
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Zira') ||
        voice.name.includes('Samantha')
      );

      utterance.voice = femaleVoice || voices[1];
      console.log('Using voice:', utterance.voice.name);

      utterance.rate = 1.1;  // Slightly faster but natural
      utterance.pitch = 1;   // Natural pitch
      utterance.volume = 1;
      utterance.lang = 'en-US';

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (error) => {
        console.error('Speech error:', error);
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [voices]);

  // Improved voice loading
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        console.log('Available voices:', allVoices.map(v => v.name));
        setVoices(allVoices);
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Recognized text:', transcript);
      
      try {
        const response = await run(transcript);
        console.log('Gemini response:', response);
        if (response) {
          await speak(response);
        }
      } catch (error) {
        console.error('Error processing:', error);
        speak("I'm sorry, I couldn't process that. Please try again.");
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }, [speak]);

  const handleInteraction = useCallback(() => {
    if (!recognition || isListening) return;

    try {
      recognition.start();
      setIsListening(true);
      console.log('Started listening...');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  }, [recognition, isListening]);

  // Ensure microphone permissions
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => console.log('Microphone permission granted'))
      .catch(error => console.error('Microphone permission denied:', error));
  }, []);

  return (
    <datacontext.Provider value={{
      speak,
      handleInteraction,
      isListening,
      voicesLoaded,
      isSpeaking
    }}>
      {children}
    </datacontext.Provider>
  );
}

export default UserContext;