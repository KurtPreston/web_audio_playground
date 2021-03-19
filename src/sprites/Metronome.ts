import {Sprite} from './Sprite';

import {autobind} from 'core-decorators';
import {times} from 'lodash';
import {Transport} from 'tone';
import {Seconds} from 'tone/build/esm/core/type/Units';
import {WorldState} from '../types/State';

@autobind
export class Metronome implements Sprite {
  private beat: number = 0;
  private readonly transportSubscription: () => void;

  constructor() {
    const tonejsScheduleId = Transport.scheduleRepeat(this.onBeat, '4n');
    this.transportSubscription = () => Transport.cancel(tonejsScheduleId);
  }

  private onBeat(time: Seconds) {
    this.beat++;
  }

  public tick() {}

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    canvas.fillStyle = 'white';
    canvas.strokeStyle = 'white';
    times(4, (beat: number) => {
      const x = ((beat % 4) + 1) * 50;
      const y = 100;
      canvas.beginPath();
      canvas.arc(x, y, 25, 0, 2 * Math.PI);
      if (beat === this.beat % 4) {
        canvas.fill();
      } else {
        canvas.stroke();
      }
    });
  }

  public destroy() {
    this.transportSubscription();
  }
}
