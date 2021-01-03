import {random} from 'lodash';
import {Player, ToneAudioNode} from 'tone';
import {timingFunction, TimingFunctionType} from '../../math/timingFunctions';
import {Dimensions, IPosition, WorldState} from '../../types/State';
import {Sprite} from '../Sprite';

interface Beat {
  position: IPosition;
  frame: number;
  numFrames: number;
  maxSize: number;
  color: string;
}

export class BeatFireworks implements Sprite {
  private readonly beats: Set<Beat> = new Set<Beat>();
  private readonly kick: Player;

  constructor(channel: ToneAudioNode) {
    this.kick = new Player('/samples/kick.wav');
    this.kick.connect(channel);
  }

  private generateBeat(dimensions: Dimensions): Beat {
    const {width, height} = dimensions;
    this.kick.start();
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
      canvas.beginPath();
      canvas.arc(x, y, size, 0, 2 * Math.PI);
      canvas.fill();
    });
  }

  public tick(world: WorldState) {
    // Advance beat frames
    this.beats.forEach((beat: Beat) => {
      beat.frame++;
      if (beat.frame > beat.numFrames) {
        this.beats.delete(beat);
      }
    });

    // Create new beat every 20 frames
    const framesPerMeasure = 20;
    const beat1 = 0;
    const beat4 = (framesPerMeasure * 3) / 4;
    const beat = world.frameNum % framesPerMeasure;
    const measure = Math.floor(world.frameNum / framesPerMeasure);
    if (beat === beat1 || (beat === beat4 && measure % 4 === 1)) {
      this.beats.add(this.generateBeat(world.dimensions));
    }
  }
}
