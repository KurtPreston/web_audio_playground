import {Sprite} from './Sprite';

import {autobind} from 'core-decorators';
import {times} from 'lodash';
import {Transport} from 'tone';
import {Seconds} from 'tone/build/esm/core/type/Units';
import {WorldState} from '../types/State';
import {circle} from './renderHelpers/circle';

@autobind
export class Metronome implements Sprite {
  private beat: number = 0;
  private readonly transportSubscription: () => void;

  constructor() {
    const tonejsScheduleId = Transport.scheduleRepeat(this.onBeat, '4n');

    this.transportSubscription = () => Transport.cancel(tonejsScheduleId);
  }

  private onBeat(time: Seconds): void {
    const beat = Transport.position.toString().split(':')[1];
    this.beat = parseInt(beat);
  }

  public tick(): void {}

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    canvas.fillStyle = 'white';
    canvas.strokeStyle = 'white';
    times(4, (beat: number) => {
      const onBeat = beat === this.beat % 4;
      circle({
        x: ((beat % 4) + 1) * 50,
        y: 100,
        r: 25,
        fill: onBeat ? 'white' : undefined,
        stroke: onBeat ? undefined : 'white',
        canvas
      });
    });
  }

  public destroy() {
    this.transportSubscription();
  }
}
