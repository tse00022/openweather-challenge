'use client'
import React, { useState, useEffect } from "react";
import moment from "moment";
import styles from "./Maindata.module.css";

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
    <div className={styles.mainPage} style={{ backgroundImage: `url("./pics/01d.jpg")`, backgroundSize: "cover" }}>
      <div className={styles.container}>
        <div className={styles.cityData}>
          <div className={styles.sectionTitle}>Daily Forecast</div>
          <span className={styles.cityName}>{data.city.name}</span>
          <br />
          <span className={styles.cityDate}>{formatDate(data.list[0].dt, data.city.timezone)}</span>
        </div>

        <div className={styles.mainDataContainer}>
          {!cityValid && <span>City "{city}" not found</span>}
          <div className={styles.temperatureContainer}>
            <img src={weatherIcon(data.list[0].weather[0].icon)} alt="weather icon" />
            <div class="flex flex-col justify-center">
              <span className={styles.temperatureDisplay}>{data.list[0].main.temp.toFixed(1)}°</span>
              <span className={styles.temperatureDescription}>{data.list[0].weather[0].description}</span>
            </div>
          </div>

          <div className={styles.iconContainer}>
            <div className={styles.iconItem}>
              <span className={styles.iconValue}>{data.list[0].main.temp_max.toFixed(1)}</span>
              <br />
              <span className={styles.iconLabel}>High</span>
            </div>
            <div className={styles.iconItem}>
              <span className={styles.iconValue}>{data.list[0].wind.speed.toFixed()} km/h</span>
              <br />
              <span className={styles.iconLabel}>Wind Speed</span>
            </div>
            <div className={styles.iconItem}>
              <span className={styles.iconValue}>{formatTime(data.city.sunrise, data.city.timezone)}</span>
              <br />
              <span className={styles.iconLabel}>Sunrise</span>
            </div>
            <div className={styles.iconItem}>
              <span className={styles.iconValue}>{data.list[0].main.temp_min.toFixed(1)}</span>
              <br />
              <span className={styles.iconLabel}>Low</span>
            </div>
            <div className={styles.iconItem}>
              <span className={styles.iconValue}>{data.list[0].main.humidity}%</span>
              <br />
              <span className={styles.iconLabel}>Humidity</span>
            </div>
            <div className={styles.iconItem}>
              <span className={styles.iconValue}>{formatTime(data.city.sunset, data.city.timezone)}</span>
              <br />
              <span className={styles.iconLabel}>Sunset</span>
            </div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Five Days Forecast</div>
        <div className={styles.dailyWeatherContainer}>
          {data.list.slice(7, 40).filter((_, index) => index % 8 === 0).map((item, index) => (
            <div key={index} className={styles.dayContainer}>
              <span className={styles.dayName}>{moment(new Date().setTime(item.dt * 1000)).format("ddd")}</span>
              <br />
              <img src={weatherIcon(item.weather[0].icon)} alt="weather icon" />
              <br />
              <span className={styles.dayDataLabel}>Temp</span>
              <span className={styles.dayDataValue}>{item.main.temp.toFixed(1)} C°</span>
              <br />
              <span className={styles.dayDataLabel}>Feel like</span>
              <span className={styles.dayDataValue}>{item.main.feels_like.toFixed(1)} C°</span>
              <br />
              <span className={styles.dayDataLabel}>Moist</span>
              <span className={styles.dayDataValue}>{item.main.humidity.toFixed()}%</span>
              <br />
              <span className={styles.dayDataLabel}>{item.weather[0].main}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
