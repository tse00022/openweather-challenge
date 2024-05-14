'use client';
import React, { useEffect, useState } from 'react';

let recognition;
if (typeof window !== 'undefined') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

const SpeechRecognitionComponent = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  console.log('SpeechRecognitionComponent created');

  useEffect(() => {
    if (!recognition) return;
    console.log('useEffect called, recognition created');

    const handleStart = () => setListening(true);
    const handleEnd = () => {
      console.log('Recognition ended, restart');
      setListening(false);
      recognition.start(); // Restart recognition
    };
    const handleResult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      onResult(transcript);
    };

    recognition.addEventListener('start', handleStart);
    recognition.addEventListener('end', handleEnd);
    recognition.addEventListener('result', handleResult);

    return () => {
      recognition.removeEventListener('start', handleStart);
      recognition.removeEventListener('end', handleEnd);
      recognition.removeEventListener('result', handleResult);
      recognition.stop();
    };
  }, [onResult]);

  const startListening = () => {
    if (recognition) recognition.start();
  };

  const stopListening = () => {
    if (recognition) recognition.stop();
  };

  return (
    <div>
      <button onClick={startListening} disabled={listening}>Start Listening</button>
      <button onClick={stopListening} disabled={!listening}>Stop Listening</button>
    </div>
  );
};

export default SpeechRecognitionComponent;
