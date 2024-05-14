'use client'
import React, { useState, useEffect } from "react";
import moment from "moment";
import LoadingPrompt from "./LoadingPrompt";
import MicrophonePrompt from "./MicrophonePrompt";
import { createModel, KaldiRecognizer } from "vosk-browser";
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
      const model = await createModel("/models/vosk-model-small-en-us-0.15.tar.gz");
      const recognizer = new model.KaldiRecognizer(16000);
      recognizer.on("result", (message) => {
        console.log(`Result: ${message.result.text}`);
        handleVoiceCommand(message.result.text);
      });
      recognizer.on("partialresult", (message) => {
        if (message.result.partial){
          console.log(`Partial result: ${message.result.partial}`);
          setText(message.result.partial);
        }
      });
      setRecognizer(recognizer);
    };

    if (microphoneEnabled) {
      setupVoiceRecognition();
    }
  }, [microphoneEnabled]);

  useEffect(() => {
    const startVoiceRecognition = async () => {
      if (recognizer) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000
          },
        });

        const audioContext = new AudioContext();

        // Define the AudioWorkletProcessor as a string
        const processorCode = `
          class RecognizerProcessor extends AudioWorkletProcessor {
            process(inputs, outputs, parameters) {
              const input = inputs[0];
              if (input.length > 0) {
                const inputBuffer = input[0];
                const buffer = new Float32Array(inputBuffer.length);
                inputBuffer.forEach((sample, index) => {
                  buffer[index] = sample;
                });
                this.port.postMessage(buffer);
              }
              return true;
            }
          }
          registerProcessor('recognizer-processor', RecognizerProcessor);
        `;

        // Create a Blob URL from the processor code
        const blob = new Blob([processorCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        // Add the module to the AudioWorklet
        await audioContext.audioWorklet.addModule(url);

        const recognizerNode = new AudioWorkletNode(audioContext, 'recognizer-processor');
        recognizerNode.port.onmessage = (event) => {
          try {
            const audioBuffer = audioContext.createBuffer(1, event.data.length, audioContext.sampleRate);
            audioBuffer.copyToChannel(event.data, 0);
            recognizer.acceptWaveform(audioBuffer);
          } catch (error) {
            console.error('acceptWaveform failed', error);
          }
        };

        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(recognizerNode);
      }
    };

    if (recognizer) {
      startVoiceRecognition();
    }
  }, [recognizer]);

  const handleVoiceCommand = (command) => {
    const keywords = ["open weather"];
    const options = {
      scorer: fuzz.partial_ratio,
      processor: (choice) => choice.toLowerCase()
    };
    const bestMatch = fuzz.extract(command, keywords, options)[0];
    if (bestMatch && bestMatch[1] > 50) { // Adjust the threshold as needed
      console.log("Matched command:", bestMatch[0]);
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

  const weatherIcon = (iconCode) => `/icons/${iconCode}.svg`;

  return (
    <div>
      {data && !microphoneEnabled && <MicrophonePrompt />}
      {!data && <LoadingPrompt />}
      {data && microphoneEnabled && <div className="flex flex-col pt-4 md:pt-0 justify-center bg-cover w-full min-h-screen" style={{ backgroundImage }}>
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
              <img src={weatherIcon(data.list[0].weather[0].icon)} alt="weather icon" className="w-1/2" />
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
                  <div className="flex justify-center"><img src={weatherIcon(item.weather[0].icon)} alt="weather icon" className="w-20" /></div>
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
