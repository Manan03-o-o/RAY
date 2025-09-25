import React, { useContext, useEffect } from 'react';
import "./App.css";
import va from "./assets/rayai.png";
import { CiMicrophoneOn } from "react-icons/ci";
import { datacontext } from './context/UserContext';
import speakimg from "./assets/speak.gif";
console.log("App component loaded");
console.log("App component mounted");


function App() {
  const { speak, handleInteraction, isListening, voicesLoaded } = useContext(datacontext);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (voicesLoaded) {
        speak("Hello, I'm Ray");
        console.log('Initial greeting played');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [voicesLoaded, speak]);

  const handleClick = () => {
    if (!voicesLoaded) {
      console.log('Voices not loaded yet');
      return;
    }
    console.log('Button clicked, starting interaction');
    handleInteraction();
  };

  return (
    <div className='main'>
      <img src={va} alt="AI Image" id="ray" />
      <span>I'm Ray, Your Advanced Virtual Assistant</span>
      <button 
        onClick={handleClick}
        style={{ backgroundColor: isListening ? '#ff4444' : '#4CAF50' }}
        disabled={!voicesLoaded}
      >
        {isListening ? 'Listening...' : 'Click here'} <CiMicrophoneOn />
      </button>
      {isListening && (
        <div className="listening-indicator">
          <img src={speakimg} alt="Speaking animation" id="speak" />
          <p>Listening...</p>
        </div>
      )}
    </div>
  );
}

export default App;
