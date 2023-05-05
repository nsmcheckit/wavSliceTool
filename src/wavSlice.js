// const fs = require('fs');
// //const audioDecode = require('audio-decode');
// const audioBufferUtils = require('audio-buffer-utils');
// const toWav = require('audiobuffer-to-wav');

// async function wavSlice(endTime,inputFilePath,outputFilePath){
//   fs.readFile(inputFilePath, (err, fileBuffer) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     const audioDecodeModule = import('audio-decode');
//     const audioDecode = audioDecodeModule.default;
//     // 解码音频文件
//     audioDecode(fileBuffer.buffer)
//       .then((audioBuffer) => {
//         // 计算裁剪的结束位置（采样）
//         const endSample = Math.floor(endTime * audioBuffer.sampleRate);
  
//         // 裁剪音频
//         const slicedBuffer = audioBufferUtils.slice(audioBuffer, 0, endSample);
  
//         // 将 AudioBuffer 转换为 WAV 文件
//         const wavBuffer = toWav(slicedBuffer);
  
//         // 保存裁剪后的音频文件
//         fs.writeFile(outputFilePath, Buffer.from(wavBuffer), (err) => {
//           if (err) {
//             console.error(err);
//             return;
//           }
//           console.log('Audio sliced and saved to', outputFilePath);
//         });
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   });
// }

// module.exports = wavSlice;
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


