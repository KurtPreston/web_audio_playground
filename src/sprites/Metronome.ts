import {Sprite} from './Sprite';

import {autobind} from 'core-decorators';
import {times} from 'lodash';
import {Draw, Player, ToneAudioNode, Transport} from 'tone';
import {Seconds} from 'tone/build/esm/core/type/Units';
import {WorldState} from '../types/State';
import {circle} from './renderHelpers/circle';

@autobind
export class Metronome implements Sprite {
  private beat: number = 0;
  private readonly transportSubscription: () => void;

  private readonly kick = new Player('/samples/kick.wav');
  private readonly hat = new Player('/samples/hihat.wav');

  constructor(channel: ToneAudioNode) {
    const tonejsScheduleId = Transport.scheduleRepeat(this.onBeat, '4n');

    this.transportSubscription = () => Transport.cancel(tonejsScheduleId);
    this.kick.connect(channel);
    this.hat.connect(channel);
  }

  private onBeat(time: Seconds): void {
    const position = Transport.position.toString();
    const beat = parseInt(position.split(':')[1]);
    Draw.schedule(() => {
      this.beat = beat;
    }, time);

    if (beat % 4 === 0) {
      if (this.kick.loaded) {
        this.kick.start(time);
      }
    } else {
      if (this.hat.loaded) {
        this.hat.start(time);
      }
    }
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
    this.kick.dispose();
    this.hat.dispose();
  }
}
