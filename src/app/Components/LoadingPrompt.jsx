'use client';
import React from 'react';

const LoadingPrompt = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <span className="ml-4 text-lg font-semibold text-gray-700">Fetching weather info...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingPrompt;
