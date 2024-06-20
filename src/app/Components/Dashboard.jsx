'use client'
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import LoadingPrompt from "./LoadingPrompt";
import MicrophonePrompt from "./MicrophonePrompt";
import InfoOverlay from "./InfoOverlay";
import { calculateSimilarity } from "../../utils/stringSimilarity";

export default function Dashboard({ baseURL }) {
  const [weatherData, setWeatherData] = useState(null);
  const [cityValid, setCityValid] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(`url("./pics/01d.jpg")`);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [text, setText] = useState("");
  const [weatherUpdateInterval, setWeatherUpdateInterval] = useState(null);
  const [overlayIcon, setOverlayIcon] = useState(null);
  const [overlayText, setOverlayText] = useState("");
  const [overlayTranscript, setOverlayTranscript] = useState("");
  const [voiceStack, setVoiceStack] = useState([]);
  const recognitionRef = useRef(null);

  // Display notification that voice control is ready
  useEffect(() => {
    if (microphoneEnabled && latitude && longitude && weatherData) {
      showOverlay("Say 'How's the weather' to get start", "voice-control", "voice control ready", )
    }
    setTimeout(() => {
      showOverlay("", null, "")
    }, 3000);
    
  }, [microphoneEnabled, latitude, longitude, weatherData]);

  // Fetch weather data based on latitude and longitude
  const fetchWeatherData = async () => {
    if (latitude && longitude) {
      const url = `${baseURL}/api/weather?lat=${latitude}&lon=${longitude}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          setCityValid(false);
          return;
        }
        const actualData = await response.json();
        setCityValid(true);
        setWeatherData(actualData);
        setBackgroundImage(`url("./pics/${actualData.list[0].weather[0].icon}.jpg")`);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    }
  };

  // Initial setup: check microphone permission and fetch location
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneEnabled(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setMicrophoneEnabled(false);
      }
    };

    const fetchLocation = async () => {
      try {
        // Get location from IP
        const locationResponse = await fetch(`${baseURL}/api/location`);
        const location = await locationResponse.json();
        setLatitude(location.loc.split(",")[0]);
        setLongitude(location.loc.split(",")[1]);
      } catch (error) {
        console.error("Failed to fetch location data:", error);
        // Set ottawa as default location
        setLatitude(43.7946);
        setLongitude(-79.2644);
      }
    };

    fetchLocation();
    checkMicrophonePermission();
  }, []);

  // Fetch weather data every 30 minutes after location is confirmed
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData();
      const interval = setInterval(fetchWeatherData, 1800000); // 30 minutes in milliseconds
      setWeatherUpdateInterval(interval);
      return () => clearInterval(interval);
    }
  }, [latitude, longitude]);

  // Voice recognition setup after microphone permission is granted
  useEffect(() => {
    const setupVoiceRecognition = async () => {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new Recognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript

        setText(transcript);

        if (event.results[event.results.length - 1].isFinal) {
          setVoiceStack([transcript]);
        }
      };

      // start voice recognition
      recognition.start();
    };

    if (microphoneEnabled) {
      setupVoiceRecognition();
    }

    return () => {
      // stop voice recognition
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.stop();
      }
    };
  }, [microphoneEnabled]);

  useEffect(() => {
    const voice = voiceStack.shift();
    matchVoiceCommand(voice);
  }, [voiceStack]);

  // Speak the given text using the Web Speech API
  const speak = (text) => {
    //stop voice recognition
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      // Resume voice recognition after speaking
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.start();
      }
      showOverlay("", null, "")
    };
    speechSynthesis.speak(utterance);
  };

  // Show an overlay with the given icon and text
  const showOverlay = (transcript, icon, text) => {
    setOverlayTranscript(transcript);
    setOverlayIcon(icon);
    setOverlayText(text);
  };

  // Sleep function to pause execution for a given number of milliseconds
  function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
  }

  // Match the voice command to predefined commands and execute the corresponding action
  const matchVoiceCommand = async (voice) => {
    if (!voice) {
      return;
    }

    const commands = ["how's the weather"];
    const threshold = 90;

    const voiceWords = voice.toLowerCase().split(' ');
    let bestMatch = null;
    let bestScore = 0;

    commands.forEach(command => {
      const commandWords = command.toLowerCase().split(' ');
      const score = calculateSimilarity(voiceWords, commandWords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = command;
      }
    });

    if (bestMatch && bestScore > threshold) {
      setVoiceStack([]);

      const locationResponse = await fetch(`${baseURL}/api/location`);
      const location = await locationResponse.json();
      const lat = location.loc.split(",")[0];
      const lon = location.loc.split(",")[1];

      const weatherResponse = await fetch(`${baseURL}/api/weather?lat=${lat}&lon=${lon}`);
      const data = await weatherResponse.json();

      console.log("Matched command:", bestMatch, "with score:", bestScore, "for command:", voice);
      const weatherTranscript = `Today's temperature is from ${data.list[0].main.temp_min.toFixed(1)} to ${data.list[0].main.temp_max.toFixed(1)} Celsius, mainly ${data.list[0].weather[0].description}, Humidity is ${data.list[0].main.humidity}%.`;
      speak(weatherTranscript);
      showOverlay(weatherTranscript, data.list[0].weather[0].icon, data.list[0].weather[0].description);
    } else {
      console.log("No matching command found.");
    }
  };

  // Format the date based on timestamp and timezone
  const formatDate = (timestamp, timezone) => {
    return moment.utc(new Date().setTime(timestamp * 1000)).add(timezone, "seconds").format("dddd, MMMM Do YYYY");
  };

  // Format the time based on timestamp and timezone
  const formatTime = (timestamp, timezone) => {
    return moment.utc(timestamp, "X").add(timezone, "seconds").format("h:mm a");
  };

  return (
    <div>
      {weatherData && !microphoneEnabled && <MicrophonePrompt />}
      {!weatherData && <LoadingPrompt />}
      {weatherData && microphoneEnabled && (
        <div className="flex flex-col pt-4 md:pt-0 justify-center bg-cover w-full min-h-screen" style={{ backgroundImage }}>
          <div className="align-middle mx-4 py-4 lg:mx-10 bg-gradient-to-r from-black to-[#0a2e3f73] rounded-2xl">
            <div className=" w-full pb-4 flex flex-wrap">
              <div className="pl-4 pt-4">
                <div className="text-3xl font-bold">{weatherData.city.name}</div>
                <span className="pt-0 text-right text-sm font-bold text-lightgray">{formatDate(weatherData.list[0].dt, weatherData.city.timezone)}</span>
                <div>{text}</div>
              </div>
            </div>
            <div className="border-b-2 pb-8 flex flex-wrap">
              {!cityValid && <span>City {city} not found</span>}
              <div className="flex h-[8rem] w-1/2 flex-row sm:border-r-2">
                <img src={`/icons/${weatherData.list[0].weather[0].icon}.svg`} alt="weather icon" className="w-1/2" />
                <div className="flex flex-col justify-center ml-5 md:ml-10">
                  <span className="text-4xl font-bold">{weatherData.list[0].main.temp.toFixed(1)}°</span>
                  <span className="text-sm font-bold text-lightgray">{weatherData.list[0].weather[0].description}</span>
                </div>
              </div>
              <div className="h-[8rem] sm:w-1/2 flex-grow text-center flex flex-wrap w-min-content">
                <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                  <span className="text-2xl font-bold">{weatherData.list[0].main.temp_max.toFixed(1)}</span>
                  <div className="text-sm font-bold text-lightgray">High</div>
                </div>
                <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                  <span className="text-2xl font-bold">{weatherData.list[0].wind.speed.toFixed()} km/h</span>
                  <div className="text-sm font-bold text-lightgray">Wind Speed</div>
                </div>
                <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                  <span className="text-2xl font-bold">{formatTime(weatherData.city.sunrise, weatherData.city.timezone)}</span>
                  <div className="text-sm font-bold text-lightgray">Sunrise</div>
                </div>
                <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                  <span className="text-2xl font-bold">{weatherData.list[0].main.temp_min.toFixed(1)}</span>
                  <div className="text-sm font-bold text-lightgray">Low</div>
                </div>
                <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                  <span className="text-2xl font-bold">{weatherData.list[0].main.humidity}%</span>
                  <div className="text-sm font-bold text-lightgray">Humidity</div>
                </div>
                <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                  <span className="text-2xl font-bold">{formatTime(weatherData.city.sunset, weatherData.city.timezone)}</span>
                  <div className="text-sm font-bold text-lightgray">Sunset</div>
                </div>
              </div>
            </div>
            <div className="pt-6 pl-4 text-2xl font-semibold">Five Days Forecast</div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1 w-full justify-center items-center h-auto pt-1 px-2.5">
              {weatherData.list.slice(7, 40).filter((_, index) => index % 8 === 0).map((item, index) => (
                <div key={index} className="day-forecast pb-4 flex flex-col grow h-full text-center pt-8 border border-white-300">
                  <div className="flex flex-col grow h-full">
                    <span className="text-xl font-bold">{moment(new Date().setTime(item.dt * 1000)).format("ddd")}</span>
                    <div className="flex justify-center"><img src={`/icons/${item.weather[0].icon}.svg`} alt="weather icon" className="w-20" /></div>
                    <div className="pt-2 font-bold text-lg">{item.weather[0].main}</div>
                    <div className="pt-2 font-bold text-lg">Temp <span className="text-base text-lightgray">{item.main.temp.toFixed(1)} C°</span></div>
                    <div className="pt-2 font-bold text-lg">Feel <span className="text-base text-lightgray">{item.main.feels_like.toFixed(1)} C°</span></div>
                    <div className="pt-2 font-bold text-lg">Humidity <span className="text-base text-lightgray">{item.main.humidity.toFixed()}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <InfoOverlay transcript={overlayTranscript} icon={overlayIcon} text={overlayText} />
        </div>
      )}
    </div>
  );
}
