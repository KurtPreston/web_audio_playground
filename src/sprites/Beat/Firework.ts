import {IPosition} from '../../types/State';

export interface Firework {
  position: IPosition;
  frame: number;
  numFrames: number;
  maxSize: number;
  color: string;
}
