import {acf2plus} from './detectors/acf2plus';
import {AMDF} from './detectors/amdf';
import {DynamicWavelet} from './detectors/dynamic_wavelet';
import {Macleod} from './detectors/macleod';
import {YIN} from './detectors/yin';
import {frequencies} from './tools/frequencies';

// module.exports = {
//   AMDF,
//   YIN,
//   DynamicWavelet,
//   Macleod,
//   ACF2PLUS,
//   frequencies
// };

export const Pitchfinder = {
  acf2plus,
  DynamicWavelet,
  frequencies,
  Macleod,
  AMDF,
  YIN
};
