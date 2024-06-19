// utils/stringSimilarity.js
import * as fuzz from 'fuzzball';

// Calculate similarity between voice input and command
export const calculateSimilarity = (voiceWords, commandWords) => {
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