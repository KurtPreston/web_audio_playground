import {DeviceOrientation} from '../types/State';

export function spin(orientation: DeviceOrientation): number {
  // those angles are in degrees
  const {beta, gamma} = orientation;

  if (!beta || !gamma) {
    return 0;
  }

  // JS math works in radians
  const betaR = (beta / 180) * Math.PI;
  const gammaR = (gamma / 180) * Math.PI;
  const spinR = Math.atan2(Math.cos(betaR) * Math.sin(gammaR), Math.sin(betaR));

  // convert back to degrees
  return (spinR * 180) / Math.PI;
}
