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
    <div className="bg-cover w-full h-screen" style={{ backgroundImage: `url("./pics/01d.jpg")` }}>
      <div className="mx-10 bg-gradient-to-r from-black to-[#0a2e3f73] p-0 rounded-2xl">
        <div className="text-white text-center w-full border-b-2 pb-4 flex flex-wrap">
          <div className="pl-4 pt-4">
            <div className="text-3xl font-bold font-roboto text-white">{data.city.name}</div>
            <span className="pt-0 text-right text-sm font-bold font-sans text-lightgray">{formatDate(data.list[0].dt, data.city.timezone)}</span>
          </div>
        </div>

        <div className="text-white text-center w-full border-b-2 pb-8 flex flex-wrap">
          {!cityValid && <span>City "{city}" not found</span>}
          <div className="text-center flex h-[15rem] lg:w-1/2 flex-row lg:border-r-2">
            <img src={weatherIcon(data.list[0].weather[0].icon)} alt="weather icon" className="w-1/2" />
            <div className="flex flex-col justify-center lg:ml-20 md:ml-10 sm:ml-5">
              <span className="text-4xl font-bold font-alexandria">{data.list[0].main.temp.toFixed(1)}°</span>
              <span className="text-sm font-bold font-sans text-lightgray">{data.list[0].weather[0].description}</span>
            </div>
          </div>

          <div className="h-[15rem] flex-grow text-center flex flex-wrap w-min-content">
            <div className="w-1/3 h-1/2 flex-grow text-center pt-8">
              <span className="text-2xl font-bold font-alexandria">{data.list[0].main.temp_max.toFixed(1)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-lightgray">High</span>
            </div>
            <div className="w-1/3 h-1/2 flex-grow text-center pt-8">
              <span className="text-2xl font-bold font-alexandria">{data.list[0].wind.speed.toFixed()} km/h</span>
              <br />
              <span className="text-sm font-bold font-sans text-lightgray">Wind Speed</span>
            </div>
            <div className="w-1/3 h-1/2 flex-grow text-center pt-8">
              <span className="text-2xl font-bold font-alexandria">{formatTime(data.city.sunrise, data.city.timezone)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-lightgray">Sunrise</span>
            </div>
            <div className="w-1/3 h-1/2 flex-grow text-center pt-8">
              <span className="text-2xl font-bold font-alexandria">{data.list[0].main.temp_min.toFixed(1)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-lightgray">Low</span>
            </div>
            <div className="w-1/3 h-1/2 flex-grow text-center pt-8">
              <span className="text-2xl font-bold font-alexandria">{data.list[0].main.humidity}%</span>
              <br />
              <span className="text-sm font-bold font-sans text-lightgray">Humidity</span>
            </div>
            <div className="w-1/3 h-1/2 flex-grow text-center pt-8">
              <span className="text-2xl font-bold font-alexandria">{formatTime(data.city.sunset, data.city.timezone)}</span>
              <br />
              <span className="text-sm font-bold font-sans text-lightgray">Sunset</span>
            </div>
          </div>
        </div>

        <div className="pt-6 pl-4 text-white text-2xl font-semibold font-sans">Five Days Forecast</div>
        <div className="flex w-full justify-center items-center h-auto pt-5 px-2.5">
          {data.list.slice(7, 40).filter((_, index) => index % 8 === 0).map((item, index) => (
            <div key={index} className="h-[22rem] flex-grow text-center pt-8 border border-gray-600 text-white">
              <span className="text-xl font-bold font-sans">{moment(new Date().setTime(item.dt * 1000)).format("ddd")}</span>
              <br />
              <div className="flex justify-center"><img src={weatherIcon(item.weather[0].icon)} alt="weather icon" className="w-20" /></div>
              <span className="font-bold text-lg font-sans">Temp </span>
              <span className="text-base font-sans text-lightgray">{item.main.temp.toFixed(1)} C°</span>
              <br />
              <span className="font-bold text-lg font-sans">Feel </span>
              <span className="text-base font-sans text-lightgray">{item.main.feels_like.toFixed(1)} C°</span>
              <br />
              <span className="font-bold text-lg font-sans">Moist </span>
              <span className="text-base font-sans text-lightgray">{item.main.humidity.toFixed()}%</span>
              <br />
              <span className="font-bold text-lg font-sans">{item.weather[0].main}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
