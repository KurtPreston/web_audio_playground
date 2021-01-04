import {random} from 'lodash';
import {Player, Transport} from 'tone';
import {Subdivision} from 'tone/build/esm/core/type/Units';
import {randomWalkFactory} from '../../frameTickers/randomWalk';
import {timingFunction, TimingFunctionType} from '../../math/timingFunctions';
import {Dimensions, IWanderer, SpriteTicker, WorldState} from '../../types/State';
import {Microphone} from '../Microphone/Microphone';
import {MicrophoneConnection} from '../Microphone/MicrophoneConnection';
import {Sprite} from '../Sprite';
import {Firework} from './Firework';

interface WanderingBeatParams {
  sample: Player;
  pattern: Subdivision;
  dimensions: Dimensions;
  fireworkSize: number;
  fireworkColor: string;
  mic: Microphone;
}

export class WanderingBeat implements Sprite {
  // Positioning
  public head: IWanderer;
  private readonly ticker: SpriteTicker<IWanderer>;

  // Audio
  private readonly scheduledRepeat: number;
  private readonly sample: Player;
  private readonly micConnection: MicrophoneConnection;

  // Fireworks
  private readonly fireworkColor: string;
  private readonly fireworkSize: number;
  private readonly fireworks: Set<Firework> = new Set<Firework>();

  constructor(params: WanderingBeatParams) {
    const {sample, pattern, dimensions, fireworkSize, fireworkColor, mic} = params;

    // Wandering
    this.fireworkSize = fireworkSize;
    this.fireworkColor = fireworkColor;
    this.head = {
      x: random(dimensions.height),
      y: random(dimensions.width),
      angle: random(Math.PI * 2)
    };
    const velocity = random(1, 7);
    this.ticker = randomWalkFactory({
      velocity,
      jitter: random(0.01, 0.3),
      lean: 0,
      bounceOffEdge: true
    });

    // Connect
    this.micConnection = mic.connect({
      sourceAudio: sample,
      sourcePosition: () => {
        return {
          position: this.head,
          vector: {
            xMomentum: velocity * Math.cos(this.head.angle),
            yMomentum: velocity * Math.sin(this.head.angle)
          }
        };
      },
      pitchBend: (ratio: number): void => {
        sample.playbackRate = ratio;
      }
    });

    // Trigger samples
    this.sample = sample;
    this.scheduledRepeat = Transport.scheduleRepeat((time) => {
      this.beat(time);
    }, pattern);
  }

  private beat(time: number) {
    // Trigger sample
    if (this.sample.loaded) {
      this.sample.start(time);
    }

    // Create firework
    const firework: Firework = {
      position: {
        x: this.head.x,
        y: this.head.y
      },
      frame: 0,
      numFrames: 30,
      maxSize: this.fireworkSize,
      color: this.fireworkColor
    };
    this.fireworks.add(firework);
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    // Render head
    canvas.fillStyle = this.fireworkColor;
    canvas.beginPath();
    canvas.arc(this.head.x, this.head.y, 3, 0, 2 * Math.PI);
    canvas.fill();

    // Render fireworks
    this.fireworks.forEach(({position, frame, numFrames, maxSize}) => {
      const size = timingFunction({
        type: TimingFunctionType.quad,
        maxValue: maxSize,
        frame,
        numFrames,
        reverse: true
      });
      const {x, y} = position;
      canvas.beginPath();
      canvas.arc(x, y, size, 0, 2 * Math.PI);
      canvas.fill();
    });
  }

  public tick(world: WorldState): void {
    // Move the head
    this.head = this.ticker(this.head, world);

    // Advance firework frames
    this.fireworks.forEach((firework: Firework) => {
      firework.frame++;
      if (firework.frame > firework.numFrames) {
        this.fireworks.delete(firework);
      }
    });

    // Update microphone
    this.micConnection.tick();
  }

  public destroy() {
    this.micConnection.destroy();
    this.fireworks.clear();
    Transport.cancel(this.scheduledRepeat);
  }
}
