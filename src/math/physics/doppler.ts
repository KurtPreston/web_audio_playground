import {DopplerMode} from '../../sprites/Microphone/MicrophoneAudioSettings.generated';
import {IPosition, IVector} from '../../types/State';
import {angleBetween} from '../trig/angleBetween';

export interface DopplerParams {
  source: {
    freq: number;
    position: IPosition;
    vector: IVector;
  };
  target: {
    position: IPosition;
    vector: IVector;
  };
  settings: {
    speedOfSound: number;
    dopplerMode: DopplerMode;
  };
}

// Returns the frequency perceived by the target
export function doppler(params: DopplerParams): number {
  const {settings, source, target} = params;
  const {speedOfSound, dopplerMode} = settings;

  if (dopplerMode === DopplerMode.Off) {
    return source.freq;
  }

  // Calculate relative momentum
  const xMomentum = source.vector.xMomentum - target.vector.xMomentum;
  const yMomentum = source.vector.yMomentum - target.vector.yMomentum;

  // Calculate relative angle
  const vectorAngle = angleBetween({x: 0, y: 0}, {x: xMomentum, y: yMomentum});
  const positionAngle = angleBetween(source.position, target.position);
  const angleDiff = vectorAngle - positionAngle;

  // Calculate releative velocity
  const velocity = Math.sqrt(Math.pow(xMomentum, 2) + Math.pow(yMomentum, 2));
  const velocityTowardNode = Math.cos(angleDiff) * velocity;

  // Adjust freq
  const freqRatio =
    dopplerMode === DopplerMode.Invert
      ? Math.abs(speedOfSound - velocityTowardNode) / speedOfSound
      : Math.abs(speedOfSound + velocityTowardNode) / speedOfSound;
  return source.freq * freqRatio;
}
