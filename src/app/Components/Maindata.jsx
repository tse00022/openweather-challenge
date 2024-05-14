'use client'
import React, { useState, useEffect } from "react";
import moment from "moment";

export default function Maindata({ baseURL, city = "Ottawa", setBackgroundImageURL }) {
  const [data, setData] = useState(null);
  const [cityValid, setCityValid] = useState(false);

  const fetchWeatherData = async (city) => {
    const url = `${baseURL}/api/weather/${city}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        setCityValid(false);
        alert("City not found");
        return;
      }
      const actualData = await response.json();
      setCityValid(true);
      setData(actualData);
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const formatDate = (timestamp, timezone) => {
    return moment.utc(new Date().setTime(timestamp * 1000)).add(timezone, "seconds").format("dddd, MMMM Do YYYY");
  };

  const formatTime = (timestamp, timezone) => {
    return moment.utc(timestamp, "X").add(timezone, "seconds").format("h:mm a");
  };

  const weatherIcon = (iconCode) => `/icons/${iconCode}.svg`;

  return (
    <div className="bg-cover" style={{ backgroundImage: `url("./pics/01d.jpg")` }}>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 bg-gradient-to-r from-black to-blue-900 opacity-75 rounded-2xl">
        <div>
          <div className="pt-6 pl-4 text-white text-3xl font-bold font-sans sm:text-4xl sm:pl-10">Daily Forecast</div>
          <div className="pl-10 pt-4">
            <div className="text-4xl font-bold font-roboto text-white">{data.city.name}</div>
            <span className="text-right text-sm font-bold font-sans text-gray-300">{formatDate(data.list[0].dt, data.city.timezone)}</span>
          </div>
        </div>

        <div className="flex flex-wrap text-white text-center w-full border-b-2 border-white pb-8 md:flex-row md:border-b-0">
          {!cityValid && <span>City "{city}" not found</span>}
          <div className="flex h-60 w-full flex-row items-center justify-center border-r-2 border-white md:w-1/2">
            <img src={weatherIcon(data.list[0].weather[0].icon)} alt="weather icon" className="w-1/2" />
            <div className="flex flex-col justify-center">
              <span className="text-6xl font-bold font-alexandria ml-20 md:text-7xl">{data.list[0].main.temp.toFixed(1)}°</span>
              <span className="text-sm font-bold font-sans text-gray-300">{data.list[0].weather[0].description}</span>
            </div>
          </div>

          <div className="flex h-60 w-full flex-grow flex-wrap items-center justify-center text-center md:w-auto">
            <div className="w-1/3 flex-grow pt-8 text-center">
              <span className="text-4xl font-bold font-alexandria">{data.list[0].main.temp_max.toFixed(1)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-gray-300">High</span>
            </div>
            <div className="w-1/3 flex-grow pt-8 text-center">
              <span className="text-4xl font-bold font-alexandria">{data.list[0].wind.speed.toFixed()} km/h</span>
              <br />
              <span className="text-sm font-bold font-sans text-gray-300">Wind Speed</span>
            </div>
            <div className="w-1/3 flex-grow pt-8 text-center">
              <span className="text-4xl font-bold font-alexandria">{formatTime(data.city.sunrise, data.city.timezone)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-gray-300">Sunrise</span>
            </div>
            <div className="w-1/3 flex-grow pt-8 text-center">
              <span className="text-4xl font-bold font-alexandria">{data.list[0].main.temp_min.toFixed(1)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-gray-300">Low</span>
            </div>
            <div className="w-1/3 flex-grow pt-8 text-center">
              <span className="text-4xl font-bold font-alexandria">{data.list[0].main.humidity}%</span>
              <br />
              <span className="text-sm font-bold font-sans text-gray-300">Humidity</span>
            </div>
            <div className="w-1/3 flex-grow pt-8 text-center">
              <span className="text-4xl font-bold font-alexandria">{formatTime(data.city.sunset, data.city.timezone)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-gray-300">Sunset</span>
            </div>
          </div>
        </div>

        <div className="pt-6 pl-4 text-white text-3xl font-bold font-sans sm:text-4xl sm:pl-10">Five Days Forecast</div>
        <div className="flex h-auto w-full items-center justify-center px-2 pt-5 sm:px-10">
          {data.list.slice(7, 40).filter((_, index) => index % 8 === 0).map((item, index) => (
            <div key={index} className="flex h-88 w-60 flex-grow flex-col items-center justify-center border border-gray-600 pt-8 text-center text-white">
              <span className="text-2xl font-bold font-sans">{moment(new Date().setTime(item.dt * 1000)).format("ddd")}</span>
              <br />
              <img src={weatherIcon(item.weather[0].icon)} alt="weather icon" className="w-20" />
              <br />
              <span className="text-lg font-bold font-sans">Temp</span>
              <span className="text-base font-sans text-gray-300">{item.main.temp.toFixed(1)} C°</span>
              <br />
              <span className="text-lg font-bold font-sans">Feel like</span>
              <span className="text-base font-sans text-gray-300">{item.main.feels_like.toFixed(1)} C°</span>
              <br />
              <span className="text-lg font-bold font-sans">Moist</span>
              <span className="text-base font-sans text-gray-300">{item.main.humidity.toFixed()}%</span>
              <br />
              <span className="flex justify-center flex-wrap text-lg font-bold font-sans">{item.weather[0].main}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
