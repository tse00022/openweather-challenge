'use client'
import React from 'react';

const LocationPrompt = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-400">
      <div className="bg-white text-center rounded-lg shadow-lg p-6">
        <h1 className="text-black text-xl font-bold mb-4">Location Service Disabled</h1>
        <p className="text-black mb-6">Please enable location service to use this app.</p>
        {/* <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            // request location permission
            navigator.geolocation.getCurrentPosition(() => {
              window.location.reload();
            });
          }}
        >
          Reload page
        </button> */}
      </div>
    </div>
  );
};

export default LocationPrompt;
