'use client'

import { useState } from 'react';
import Search from './Components/Search';

export default function Page() {

  const [location, setLocation] = useState();
  const [backgroundImageURL, setBackgroundImageURL] = useState("01n");

  const handle = (e) => {
    setBackgroundImageURL(e);
    console.log("backgroundImageURL:", e); // Output the value here
  };

  return (
    <div
      className="mainpage"
      style={{
        backgroundImage: `url("./pics/${backgroundImageURL}.jpg")`,
        backgroundSize: "cover",
      }}
    >
      <div className="searchComp">
        <Search {...{ location, setLocation }} />
      </div>

      {/* <Maindata city={location} setBackgroundImageURL={handle} /> */}
    </div>
  );
}
