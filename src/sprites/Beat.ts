import {random} from 'lodash';
import {timingFunction, TimingFunctionType} from '../math/timingFunctions';
import {Dimensions, IPosition, WorldState} from '../types/State';
import {Sprite} from './Sprite';

interface Beat {
  position: IPosition;
  frame: number;
  numFrames: number;
  maxSize: number;
  color: string;
}

export class OuterSpace implements Sprite {
  private beats: Set<Beat> = new Set<Beat>();

  private generateBeat(dimensions: Dimensions): Beat {
    const {width, height} = dimensions;
    return {
      position: {
        x: random(width),
        y: random(height)
      },
      frame: 0,
      numFrames: 30,
      maxSize: 30,
      color: 'white'
    };
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.beats.forEach(({color, position, frame, numFrames, maxSize}) => {
      const size = timingFunction({
        type: TimingFunctionType.linear,
        maxValue: maxSize,
        frame,
        numFrames,
        reverse: true
      });
      const {x, y} = position;
      canvas.fillStyle = color;
      canvas.arc(x, y, size, 0, 2 * Math.PI);
    });
  }

  public tick(world: WorldState) {
    this.beats.forEach((beat: Beat) => {
      beat.frame++;
      if (beat.frame > beat.numFrames) {
        this.beats.delete(beat);
      }
    });
  }
}
