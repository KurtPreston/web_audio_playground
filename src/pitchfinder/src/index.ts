import {YIN} from './detectors/yin';
import {AMDF} from './detectors/amdf';
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
  acf2plus,
  AMDF,
  YIN
};