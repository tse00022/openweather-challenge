'use client'
import React from 'react';
import GeneralPrompt from './GeneralPrompt';

const LocationPrompt = () => {
  return (
    <GeneralPrompt
      title="Location Service Disabled"
      message="Please enable location service to use this app."
    />
  );
};

export default LocationPrompt;
