'use client';
import React, { useEffect, useState } from 'react';

const InfoOverlay = ({ icon, text, transcript }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (icon) {
      setVisible(true);
    }else {
      setVisible(false);
    }
  }, [icon]);

  return (
    visible && (
      <div className="fixed inset-0 flex items-center justify-center z-50 m-5">
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <img src={`/icons/${icon}.svg`} alt="weather icon" className="w-1/4" />
          <span className="mt-4 text-lg font-semibold text-gray-700">{text}</span>
          <span className="mt-4 text-sm text-gray-500">{transcript}</span>
        </div>
      </div>
    )
  );
};

export default InfoOverlay;
