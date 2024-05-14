'use client'
import React from 'react';
import GeneralPrompt from './GeneralPrompt';

const MicrophonePrompt = () => {
  return (
    <GeneralPrompt
      title="Microphone Access Disabled"
      message="Please enable microphone access to use voice recognition."
    />
  );
};

export default MicrophonePrompt;
