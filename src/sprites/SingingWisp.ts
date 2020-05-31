import {random} from 'lodash';
import {Channel, PanVol, Synth} from 'tone';
import {midiNoteToFreq} from '../audio/midi';
import {randomSustainSynth} from '../audio/oscillators';
import {BounceOffEdge, IForce} from '../math/traveler/forces';
import {updateTraveler} from '../math/traveler/updateTraveler';
import {IPosition, ITraveler, IVector, WorldState} from '../types';
import {NoteNode} from './NoteGraph';
import {Sprite} from './Sprite';

export class SingingWisp implements Sprite, NoteNode {
  private traveler: ITraveler;
  private forces: IForce[] = [BounceOffEdge];
  private readonly size = 20;
  private readonly color = 'white';
  public readonly note = random(36, 60);
  public readonly synth: Synth;
  public readonly panVol: PanVol;

  constructor(channel: Channel) {
    this.traveler = {
      position: {
        x: 0,
        y: 300
      },
      vector: {
        xMomentum: 30,
        yMomentum: 0
      }
    };
    this.synth = new Synth(randomSustainSynth());
    this.panVol = new PanVol();
    this.synth.connect(this.panVol);
    this.panVol.connect(channel);

    const freq = midiNoteToFreq(this.note);
    this.synth.triggerAttack(freq);
  }

  public get position(): IPosition {
    return this.traveler.position;
  }

  public get vector(): IVector {
    return this.traveler.vector;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState) {
    const {x, y} = this.traveler.position;
    canvas.beginPath();
    canvas.arc(x, y, this.size, 0, 2 * Math.PI);
    canvas.fillStyle = this.color;
    canvas.fill();
    canvas.closePath();
  }

  public tick(world: WorldState) {
    updateTraveler(this.traveler, this.forces, world);
  }
}
