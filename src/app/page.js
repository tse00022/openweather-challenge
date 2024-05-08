'use client'

// src/app/page.js

import { useEffect, useState } from 'react';

export default function Page() {
  const [message, setMessage] = useState('');
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

      if (transcript.toLowerCase().includes('testing')) {
        setMessage('Keyword triggered!');
        setTimeout(() => setMessage(''), 1000);
      }
    };

    // recognition.onend = () => {
    //   console.log('Speech recognition service disconnected, restarting...');
    //   recognition.start();
    // };

    recognition.start();

    return () => recognition.stop();
  }, []);

  useEffect(() => {
    setSpeechSynthesis(window.speechSynthesis);
  }, []);

  const handleButtonClick = () => {
    const utterance = new SpeechSynthesisUtterance('Welcome to Open Weather App');
    speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <button onClick={handleButtonClick}>Speak Welcome Message</button>
        <div>{message}</div>
      </div>
    </div>
  );
}
