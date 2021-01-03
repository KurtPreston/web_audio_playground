import {random} from 'lodash';
import {Player, Transport} from 'tone';
import {Subdivision} from 'tone/build/esm/core/type/Units';
import {randomWalkFactory} from '../../frameTickers/randomWalk';
import {timingFunction, TimingFunctionType} from '../../math/timingFunctions';
import {Dimensions, IWanderer, SpriteTicker, WorldState} from '../../types/State';
import {Sprite} from '../Sprite';
import {Firework} from './Firework';

interface WanderingBeatParams {
  sample: Player;
  pattern: Subdivision;
  dimensions: Dimensions;
  fireworkSize: number;
  fireworkColor: string;
}

export class WanderingBeat implements Sprite {
  // Positioning
  private head: IWanderer;
  private readonly ticker: SpriteTicker<IWanderer>;

  // Audio
  private readonly scheduledRepeat: number;
  private readonly sample: Player;

  // Fireworks
  private readonly fireworkColor: string;
  private readonly fireworkSize: number;
  private readonly fireworks: Set<Firework> = new Set<Firework>();

  constructor(params: WanderingBeatParams) {
    const {sample, pattern, dimensions, fireworkSize, fireworkColor} = params;

    this.fireworkSize = fireworkSize;
    this.fireworkColor = fireworkColor;
    this.head = {
      x: random(dimensions.height),
      y: random(dimensions.width),
      angle: random(Math.PI * 2)
    };
    this.ticker = randomWalkFactory({
      velocity: random(5, 9),
      jitter: random(0.01, 0.12),
      lean: random(-0.03, 0.03, true),
      bounceOffEdge: true
    });
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
    this.fireworks.forEach(({color, position, frame, numFrames, maxSize}) => {
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
    // Move the thead
    this.head = this.ticker(this.head, world);

    // Advance firework frames
    this.fireworks.forEach((firework: Firework) => {
      firework.frame++;
      if (firework.frame > firework.numFrames) {
        this.fireworks.delete(firework);
      }
    });
  }

  public destroy() {
    this.fireworks.clear();
    Transport.cancel(this.scheduledRepeat);
  }
}
