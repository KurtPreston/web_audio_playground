import {isFunction, random} from 'lodash';
import {ToneAudioNode, Transport} from 'tone';
import {Subdivision, Time} from 'tone/build/esm/core/type/Units';
import {randomWalkFactory} from '../../frameTickers/randomWalk';
import {CanvasBlendMode} from '../../games/Cables/CablesOptions.generated';
import {timingFunction, TimingFunctionType} from '../../math/timingFunctions';
import {Dimensions, IWanderer, SpriteTicker, WorldState} from '../../types/State';
import {randomColor} from '../../util/color';
import {Microphone} from '../Microphone/Microphone';
import {MicrophoneConnection} from '../Microphone/MicrophoneConnection';
import {Sprite} from '../Sprite';
import {Firework} from './Firework';

export interface Pattern {
  frequency: Subdivision;
  times: Time[];
}

interface WanderingBeatParams {
  // Audio sample
  sourceAudio: {
    source: ToneAudioNode;
    pitchBend: (ratio: number) => void;
    trigger: (time: Time) => boolean;
  };

  pattern: Pattern;
  dimensions: Dimensions;
  shipSize: number;
  fireworkSize: number;
  fireworkColor?: string | (() => string);
  fireworkBlendMode?: CanvasBlendMode;
  mic: Microphone;
}

export class WanderingBeat implements Sprite {
  // Positioning
  public head: IWanderer;
  private readonly ticker: SpriteTicker<IWanderer>;
  private readonly shipSize: number;

  // Audio
  private readonly loop: number;
  private readonly triggerSample: (time: Time) => boolean;
  private readonly micConnection: MicrophoneConnection;

  // Fireworks
  private readonly fireworkColor: string | (() => string);
  private readonly fireworkSize: number;
  private readonly fireworkBlendMode: CanvasBlendMode;
  private readonly fireworks: Set<Firework> = new Set<Firework>();

  constructor(params: WanderingBeatParams) {
    const {
      sourceAudio,
      pattern,
      dimensions,
      fireworkSize,
      fireworkColor,
      fireworkBlendMode,
      mic,
      shipSize
    } = params;

    // Wandering
    this.shipSize = shipSize;
    this.fireworkSize = fireworkSize;
    this.fireworkColor = fireworkColor || randomColor();
    this.fireworkBlendMode = fireworkBlendMode || 'hard-light';
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
      sourceAudio: sourceAudio.source,
      sourcePosition: () => {
        return {
          position: this.head,
          vector: {
            xMomentum: velocity * Math.cos(this.head.angle),
            yMomentum: velocity * Math.sin(this.head.angle)
          }
        };
      },
      pitchBend: sourceAudio.pitchBend
    });

    // Trigger samples
    this.triggerSample = sourceAudio.trigger;
    this.loop = Transport.scheduleRepeat((time: number) => {
      pattern.times.forEach((time: Time) => {
        this.beat(time);
      });
    }, pattern.frequency);
  }

  private beat(time: Time) {
    // Trigger sample
    const triggered = this.triggerSample(time);
    if (triggered) {
      // Create firework
      const firework: Firework = {
        position: {
          x: this.head.x,
          y: this.head.y
        },
        frame: 0,
        numFrames: 30,
        maxSize: this.fireworkSize,
        color: isFunction(this.fireworkColor) ? this.fireworkColor() : this.fireworkColor
      };
      this.fireworks.add(firework);
    }
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    // Render head
    canvas.fillStyle = isFunction(this.fireworkColor) ? this.fireworkColor() : this.fireworkColor;
    canvas.globalCompositeOperation = this.fireworkBlendMode;
    canvas.beginPath();
    canvas.arc(this.head.x, this.head.y, this.shipSize, 0, 2 * Math.PI);
    canvas.fill();

    // Render fireworks
    this.fireworks.forEach(({position, frame, numFrames, maxSize, color}) => {
      canvas.fillStyle = color;
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
    Transport.cancel(this.loop);
  }
}
