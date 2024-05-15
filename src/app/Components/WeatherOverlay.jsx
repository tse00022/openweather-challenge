'use client';
import React, { useEffect, useState } from 'react';

const WeatherOverlay = ({ icon, text }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (icon) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000); // Show for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [icon]);

  return (
    visible && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <img src={`/icons/${icon}.svg`} alt="weather icon" className="w-20" />
          <span className="mt-4 text-lg font-semibold text-gray-700">{text}</span>
        </div>
      </div>
    )
  );
};

export default WeatherOverlay;
