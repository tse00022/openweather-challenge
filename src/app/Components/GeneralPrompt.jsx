'use client'
import React from 'react';

const GeneralPrompt = ({ title, message }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-400">
      <div className="bg-white text-center rounded-lg shadow-lg p-6">
        <h1 className="text-black text-xl font-bold mb-4">{title}</h1>
        <p className="text-black mb-6">{message}</p>
      </div>
    </div>
  );
};

export default GeneralPrompt;
