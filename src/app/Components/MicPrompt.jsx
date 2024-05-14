'use client'
import React from 'react';
import GeneralPrompt from './GeneralPrompt';

const MicPrompt = () => {
  return (
    <GeneralPrompt
      title="Voice Recognition Service Disabled"
      message="Please enable microphone access to use voice recognition."
    />
  );
};

export default MicPrompt;