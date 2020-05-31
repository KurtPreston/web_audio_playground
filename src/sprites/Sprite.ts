import {WorldState} from '../types/State';

export interface Sprite {
  render: (canvas: CanvasRenderingContext2D, world: WorldState) => void;
  tick: (world: WorldState) => void;
  destroy?: () => void;
}
