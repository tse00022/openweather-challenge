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
    <div className={styles.mainpage} style={{ backgroundImage: `url("./pics/01d.jpg")`, backgroundSize: "cover" }}>
      <div className={styles.start}>
        <div className={styles.newpage}>
          <div className={styles.city}>
            <div className={styles.daily}>Daily Forecast</div>
            <div className={styles.dailydata}>
              <span className={styles.name}>{data.city.name}</span>
              <br />
              <span className={styles.citydate}>{formatDate(data.list[0].dt, data.city.timezone)}</span>
            </div>
          </div>

          <div className={styles.maindata}>
            {!cityValid && <span>City "{city}" not found</span>}
            <div className={styles.temper}>
              <img src={weatherIcon(data.list[0].weather[0].icon)} alt="weather icon" />
              <div className={styles.temp}>
                <span className={styles.display}>{data.list[0].main.temp.toFixed(1)}°</span>
                <br />
                <span className={styles.display1}>{data.list[0].weather[0].description}</span>
              </div>
            </div>

            <div className={styles.icon}>
              <div className={styles.acloudy}>
                <span className={styles.icon1}>{data.list[0].main.temp_max.toFixed(1)}</span>
                <br />
                <span className={styles.icon2}>High</span>
              </div>
              <div className={styles.bcloudy}>
                <span className={styles.icon1}>{data.list[0].wind.speed.toFixed()} km/h</span>
                <br />
                <span className={styles.icon2}>Wind Speed</span>
              </div>
              <div className={styles.ccloudy}>
                <span className={styles.icon1}>{formatTime(data.city.sunrise, data.city.timezone)}</span>
                <br />
                <span className={styles.icon2}>Sunrise</span>
              </div>
              <div className={styles.dcloudy}>
                <span className={styles.icon1}>{data.list[0].main.temp_min.toFixed(1)}</span>
                <br />
                <span className={styles.icon2}>Low</span>
              </div>
              <div className={styles.ecloudy}>
                <span className={styles.icon1}>{data.list[0].main.humidity}%</span>
                <br />
                <span className={styles.icon2}>Humidity</span>
              </div>
              <div className={styles.fcloudy}>
                <span className={styles.icon1}>{formatTime(data.city.sunset, data.city.timezone)}</span>
                <br />
                <span className={styles.icon2}>Sunset</span>
              </div>
            </div>
          </div>

          <div className={styles.daily}>Five Days Forecast</div>
          <div className={styles.dailyweather}>
            {data.list.slice(7, 40).filter((_, index) => index % 8 === 0).map((item, index) => (
              <div key={index} className={styles.day}>
                <span className={styles.wday}>{moment(new Date().setTime(item.dt * 1000)).format("ddd")}</span>
                <br />
                <img src={weatherIcon(item.weather[0].icon)} alt="weather icon" />
                <br />
                <span className={styles.head}>Temp</span>
                <span className={styles.val}>{item.main.temp.toFixed(1)} C°</span>
                <br />
                <span className={styles.head}>Feel like</span>
                <span className={styles.val}>{item.main.feels_like.toFixed(1)} C°</span>
                <br />
                <span className={styles.head}>Moist</span>
                <span className={styles.val}>{item.main.humidity.toFixed()}%</span>
                <br />
                <span className={styles.head}>{item.weather[0].main}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
