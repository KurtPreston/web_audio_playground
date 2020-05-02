// const AMDF = require("./detectors/amdf");
// const YIN = require("./detectors/yin");
// const DynamicWavelet = require("./detectors/dynamic_wavelet");
// const Macleod = require("./detectors/macleod");
// const ACF2PLUS = require("./detectors/acf2plus");

// const frequencies = require("./tools/frequencies");

import {acf2plus} from './detectors/acf2plus';

// module.exports = {
//   AMDF,
//   YIN,
//   DynamicWavelet,
//   Macleod,
//   ACF2PLUS,
//   frequencies
// };

export const Pitchfinder = {
  acf2plus
};