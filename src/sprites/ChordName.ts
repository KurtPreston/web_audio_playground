import {Sprite} from './Sprite';

import {autobind} from 'core-decorators';
import {Chord} from '../audio/chords';
import {Sequencer} from '../audio/Sequencer/Sequencer';
import {WorldState} from '../types/State';

@autobind
export class ChordName implements Sprite {
  private chord: Chord;
  private sequencerSubscription: () => void;

  constructor(sequencer: Sequencer) {
    this.sequencerSubscription = sequencer.subscribe(this.onChordChange);
    this.chord = sequencer.chord;
  }

  private onChordChange(chord: Chord) {
    this.chord = chord;
  }

  public tick() {}

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    canvas.font = '30px Arial';
    canvas.fillStyle = 'white';
    canvas.fillText(this.chord.name, 350, 50);
  }

  public destroy() {
    this.sequencerSubscription();
  }
}
