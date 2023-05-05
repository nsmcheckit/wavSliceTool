const fs = require('fs');

async function findFirstTimeAboveThreshold(filePath, threshold) {
  const data = await fs.promises.readFile(filePath);
  const audioDecode = await import('audio-decode');
  const audioBuffer = await audioDecode.default(data);

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const endPosition = audioBuffer.length;

  for (let position = 0; position < endPosition; position++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[position];
      const dB = 20 * Math.log10(Math.abs(sample));

      if (dB >= threshold) {
        return position / sampleRate;
      }
    }
  }

  return null;
}

module.exports = findFirstTimeAboveThreshold;
// (async () => {
//   const filePath = 'audio.wav';
//   const threshold = -48;

//   const time = await findFirstTimeAboveThreshold(filePath, threshold);

//   if (time !== null) {
//     console.log(`音量首次高于 ${threshold} dB 的时间点（秒）：${time.toFixed(3)}`);
//   } else {
//     console.log(`整个音频中，音量没有高于 ${threshold} dB 的时刻`);
//   }
// })();




