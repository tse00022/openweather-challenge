'use client'
import React, { useState, useEffect } from "react";
import moment from "moment";
import LoadingPrompt from "./LoadingPrompt";
import MicrophonePrompt from "./MicrophonePrompt";
import DownloadingPrompt from "./DownloadingPrompt";
import { createModel, KaldiRecognizer } from "vosk-browser";
import { startVoiceRecognition } from "../../utils/startVoiceRecognition";
import * as fuzz from 'fuzzball';

export default function Dashboard({ baseURL }) {
  const [data, setData] = useState(null);
  const [cityValid, setCityValid] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(`url("./pics/01d.jpg")`);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [text, setText] = useState("");
  const [downloadingModel, setDownloadingModel] = useState(false);
  let prevPartialResult = "";

  const fetchWeatherData = async () => {
    const url = `${baseURL}/api/weather?lat=${latitude}&lon=${longitude}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        setCityValid(false);
        return;
      }
      const actualData = await response.json();
      setCityValid(true);
      setData(actualData);
      setBackgroundImage(`url("./pics/${actualData.list[0].weather[0].icon}.jpg")`);
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }
  };

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

    // TODO: fix mock locations
    setLatitude(45.421532);
    setLongitude(-75.697189);
    checkMicrophonePermission();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      console.log("Fetching weather data...")
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const setupVoiceRecognition = async () => {
      setDownloadingModel(true);
      const model = await createModel("/models/vosk-model-small-en-us-0.15.tar.gz");
      setDownloadingModel(false);
      const recognizer = new model.KaldiRecognizer(16000);
      recognizer.on("partialresult", (message) => {
        if (message.result.partial != prevPartialResult){
          prevPartialResult = message.result.partial;
          setText(message.result.partial);
          matchVoiceCommand(message.result.partial);
        }
      });
      setRecognizer(recognizer);
    };

    if (microphoneEnabled) {
      setupVoiceRecognition();
    }
  }, [microphoneEnabled]);

  useEffect(() => {
    if (recognizer) {
      startVoiceRecognition(recognizer);
    }
  }, [recognizer]);

  const matchVoiceCommand = (voice) => {
    if (!voice) {
      return;
    }
  
    const commands = ["open weather"];
    const threshold = 70; // Adjust the threshold as needed
  
    const calculateSimilarity = (voiceWords, commandWords) => {
      let totalSimilarity = 0;
      commandWords.forEach(commandWord => {
        let maxSimilarity = 0;
        voiceWords.forEach(voiceWord => {
          const similarity = fuzz.ratio(voiceWord, commandWord);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
          }
        });
        totalSimilarity += maxSimilarity;
      });
      return totalSimilarity / commandWords.length;
    };
  
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
      console.log("Matched command:", bestMatch, "with score:", bestScore, "for command:", voice);
      // Execute the command
    } else {
      console.log("No matching command found.");
    }
  };

  const formatDate = (timestamp, timezone) => {
    return moment.utc(new Date().setTime(timestamp * 1000)).add(timezone, "seconds").format("dddd, MMMM Do YYYY");
  };

  const formatTime = (timestamp, timezone) => {
    return moment.utc(timestamp, "X").add(timezone, "seconds").format("h:mm a");
  };

  return (
    <div>
      {data && !microphoneEnabled && <MicrophonePrompt />}
      {!data && <LoadingPrompt />}
      {downloadingModel && <DownloadingPrompt />}
      {!downloadingModel && data && microphoneEnabled && <div className="flex flex-col pt-4 md:pt-0 justify-center bg-cover w-full min-h-screen" style={{ backgroundImage }}>
        <div className="align-middle mx-4 py-4 lg:mx-10 bg-gradient-to-r from-black to-[#0a2e3f73] rounded-2xl">
          <div className=" w-full pb-4 flex flex-wrap">
            <div className="pl-4 pt-4">
              <div className="text-3xl font-bold">{data.city.name}</div>
              <span className="pt-0 text-right text-sm font-bold text-lightgray">{formatDate(data.list[0].dt, data.city.timezone)}</span>
              <div>{text}</div>
            </div>
          </div>
          <div className="border-b-2 pb-8 flex flex-wrap">
            {!cityValid && <span>City {city} not found</span>}
            <div className="flex h-[8rem] w-1/2 flex-row sm:border-r-2">
              <img src={`/icons/${data.list[0].weather[0].icon}.svg`} alt="weather icon" className="w-1/2" />
              <div className="flex flex-col justify-center ml-5 md:ml-10">
                <span className="text-4xl font-bold">{data.list[0].main.temp.toFixed(1)}°</span>
                <span className="text-sm font-bold text-lightgray">{data.list[0].weather[0].description}</span>
              </div>
            </div>
            <div className="h-[8rem] sm:w-1/2 flex-grow text-center flex flex-wrap w-min-content">
              <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                <span className="text-2xl font-bold">{data.list[0].main.temp_max.toFixed(1)}</span>
                <div className="text-sm font-bold text-lightgray">High</div>
              </div>
              <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                <span className="text-2xl font-bold">{data.list[0].wind.speed.toFixed()} km/h</span>
                <div className="text-sm font-bold text-lightgray">Wind Speed</div>
              </div>
              <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                <span className="text-2xl font-bold">{formatTime(data.city.sunrise, data.city.timezone)}</span>
                <div className="text-sm font-bold text-lightgray">Sunrise</div>
              </div>
              <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                <span className="text-2xl font-bold">{data.list[0].main.temp_min.toFixed(1)}</span>
                <div className="text-sm font-bold text-lightgray">Low</div>
              </div>
              <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                <span className="text-2xl font-bold">{data.list[0].main.humidity}%</span>
                <div className="text-sm font-bold text-lightgray">Humidity</div>
              </div>
              <div className="w-1/3 h-1/2 flex-grow text-center pt-4">
                <span className="text-2xl font-bold">{formatTime(data.city.sunset, data.city.timezone)}</span>
                <div className="text-sm font-bold text-lightgray">Sunset</div>
              </div>
            </div>
          </div>
          <div className="pt-6 pl-4 text-2xl font-semibold">Five Days Forecast</div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-1 w-full justify-center items-center h-auto pt-1 px-2.5">
            {data.list.slice(7, 40).filter((_, index) => index % 8 === 0).map((item, index) => (
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
      </div>}
    </div>
  );
}
