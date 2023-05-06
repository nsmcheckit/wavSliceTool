const fs = require('fs');
const audioBufferUtils = require('audio-buffer-utils');
const toWav = require('audiobuffer-to-wav');

async function wavSlice(endTime, inputFilePath, outputFilePath) {
  const fileBuffer = await fs.promises.readFile(inputFilePath);

  const audioDecodeModule = await import('audio-decode');
  const audioDecode = audioDecodeModule.default;
  const audioBuffer = await audioDecode(fileBuffer.buffer);

  const endSample = Math.floor(endTime * audioBuffer.sampleRate);
  const slicedBuffer = audioBufferUtils.slice(audioBuffer, endSample, audioBuffer.length);
  const wavBuffer = toWav(slicedBuffer);

  await fs.promises.writeFile(outputFilePath, Buffer.from(wavBuffer));
  console.log('Audio sliced and saved to', outputFilePath);
}

module.exports = wavSlice;


