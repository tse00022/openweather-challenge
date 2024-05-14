export const startVoiceRecognition = async (recognizer) => {
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
