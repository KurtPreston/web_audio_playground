import {each, random} from 'lodash';
import {Player, ToneAudioNode, Transport} from 'tone';
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

interface BeatSequencerParams {
  dimensions: Dimensions;
  channel: ToneAudioNode;
}

export class BeatSequencer implements Sprite {
  private readonly beats: Set<Beat> = new Set<Beat>();
  private readonly samples: {
    kick: Player;
    hat: Player;
  };

  constructor(params: BeatSequencerParams) {
    this.samples = {
      kick: new Player('/samples/kick.wav'),
      hat: new Player('/samples/hihat.wav')
    };
    this.samples.hat.playbackRate = 2;
    each(this.samples, (sample: Player) => sample.connect(params.channel));

    // Create loops
    Transport.scheduleRepeat((time) => {
      this.beats.add(
        this.generateBeat({
          dimensions: params.dimensions,
          sample: this.samples.kick,
          color: 'white',
          size: 50
        })
      );
    }, '4n');

    Transport.scheduleRepeat((time) => {
      this.beats.add(
        this.generateBeat({
          dimensions: params.dimensions,
          sample: this.samples.hat,
          color: 'cyan',
          size: 15
        })
      );
    }, '8n');
    Transport.start();
  }

  private generateBeat(params: {
    dimensions: Dimensions;
    sample: Player;
    color: string;
    size: number;
  }): Beat {
    const {dimensions, sample, color, size} = params;
    const {width, height} = dimensions;
    if (sample.loaded) {
      sample.start();
    }
    return {
      position: {
        x: random(width),
        y: random(height)
      },
      frame: 0,
      numFrames: 30,
      maxSize: size,
      color
    };
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.beats.forEach(({color, position, frame, numFrames, maxSize}) => {
      const size = timingFunction({
        type: TimingFunctionType.quad,
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
  }
}
