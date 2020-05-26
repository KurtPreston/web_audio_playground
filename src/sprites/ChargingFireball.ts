import {random} from 'lodash';
import React from 'react';
import tinycolor from 'tinycolor2';
import {IPosition, WorldState} from '../types';
import {OverflowMode, scale} from '../util/scale';
import {FireballSpriteParams} from './Fireball';
import {Sprite} from './Sprite';

interface ChargingFireballParams {
  wave: Uint8Array;
  position: IPosition;
}

export class ChargingFireball extends Sprite {
  // Variables
  private chargeSize: number;
  private position: IPosition;
  private spinAngle: number = random(0, Math.PI * 2, true);

  // Previous state
  private lastAmplitude = 0;
  private maxChargeSize: number; // The largest size the charge has grown to
  private maxAmplitude: number = 0; // The peak amplitude
  private maxChargeWaveForm: Uint8Array;

  // Class constants
  private readonly chargeMinLaunchSize: number = 50;
  private readonly chargeMinSize: number = 5;
  private readonly chargeMaxSize: number = 150;
  private readonly shrinkRate = 2;
  private readonly growthRate = 2.5;
  private readonly amplitudeThreshold = 0.1;
  private readonly rippleRatio: number = 1.5;

  constructor(params: ChargingFireballParams) {
    super();
    this.position = params.position;
    this.chargeSize = this.chargeMinSize;
    this.maxChargeSize = this.chargeSize;
    this.maxChargeWaveForm = params.wave.slice(0);
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    // const {chargeSize, position, spinAngle} = this;
    // const {minSize, maxSize} = this.sizeBounds();
    // return circularPath({
    //   wave: world.audio.uintWave,
    //   cx: position.x,
    //   cy: position.y,
    //   minSize,
    //   maxSize,
    //   key: this.id,
    //   angle: spinAngle,
    //   style: this.fireballStyle(chargeSize)
    // });
  }

  public tick(world: WorldState) {
    // Determine how much to grow or shrink the charge
    const soundAmplitude = world.audio.amplitude - this.amplitudeThreshold;
    const amplitudeDelta = soundAmplitude - this.lastAmplitude;
    const growth =
      amplitudeDelta >= 0
        ? scale({
            input: soundAmplitude,
            inputMin: 0,
            inputMax: 1,
            outputMin: 0,
            outputMax: this.growthRate,
            overflowMode: OverflowMode.Constrain
          })
        : scale({
            input: amplitudeDelta,
            inputMin: -1 * this.amplitudeThreshold,
            inputMax: 0,
            outputMin: -1 * this.shrinkRate,
            outputMax: 0,
            overflowMode: OverflowMode.Constrain
          });

    const unboundedCargeSize = this.chargeSize ? this.chargeSize + growth : growth;
    this.chargeSize = Math.max(
      Math.min(unboundedCargeSize, this.chargeMaxSize),
      this.chargeMinSize
    );

    // Cache peak amplitude waveform
    if (this.chargeSize > this.maxChargeSize) {
      this.maxChargeSize = this.chargeSize;
      this.maxAmplitude = soundAmplitude;

      if (soundAmplitude > this.maxAmplitude) {
        this.maxChargeWaveForm = world.audio.uintWave.slice(0);
      }
    }

    // Cache previous amplitude
    this.lastAmplitude = soundAmplitude;
  }

  private fireballStyle(chargeSize: number): React.CSSProperties {
    if (chargeSize < this.chargeMinLaunchSize) {
      const blend = scale({
        input: chargeSize,
        inputMin: this.chargeMinSize,
        inputMax: this.chargeMinLaunchSize,
        outputMin: 0,
        outputMax: 100,
        overflowMode: OverflowMode.Constrain
      });
      return {
        fill: tinycolor.mix('#000', '#00a', blend).toHexString(),
        stroke: 'white',
        strokeWidth: '1px'
      };
    } else {
      const blend = scale({
        input: chargeSize,
        inputMin: this.chargeMinLaunchSize,
        inputMax: this.chargeMaxSize,
        outputMin: 0,
        outputMax: 100,
        overflowMode: OverflowMode.Constrain
      });
      return {
        fill: tinycolor.mix('#00f', '#f00', blend).toHexString(),
        stroke: tinycolor.mix('#f00', '#000', blend).toHexString(),
        strokeWidth: blend / 10
      };
    }
  }

  public launchParams(): FireballSpriteParams {
    const {chargeSize, position} = this;
    const {minSize, maxSize} = this.sizeBounds();

    return {
      velocity: scale({
        input: chargeSize,
        inputMin: this.chargeMinSize,
        inputMax: this.chargeMaxSize,
        outputMin: 7,
        outputMax: 50
      }),
      minSize,
      maxSize,
      wave: this.maxChargeWaveForm,
      state: {
        x: position.x,
        y: position.y,
        angle: (3 * Math.PI) / 2, // Facing up
        spinAngle: 0
      },
      spinMomentum: 5,
      style: this.fireballStyle(chargeSize)
    };
  }

  private sizeBounds(): {minSize: number; maxSize: number} {
    const {chargeSize, rippleRatio} = this;
    const rippleSize = rippleRatio * chargeSize;
    return {
      minSize: chargeSize - rippleSize,
      maxSize: chargeSize + rippleSize
    };
  }

  public shouldLaunch(): boolean {
    return (
      this.lastAmplitude < 0.98 * this.maxAmplitude && this.chargeSize > this.chargeMinLaunchSize
    );
  }
}
