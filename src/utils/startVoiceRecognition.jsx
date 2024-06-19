// startVoiceRecognition.jsx
export const startVoiceRecognition = (recognition) => {
  if (recognition) {
    recognition.start();
  }
};

export const stopVoiceRecognition = (recognition) => {
  if (recognition) {
    recognition.stop();
  }
};

export const resumeVoiceRecognition = (recognition) => {
  if (recognition) {
    recognition.start();
  }
};