import {distanceBetween} from '../math/trig/distanceBetween';
import {IPosition, WorldState} from '../types';
import {midiNoteToFreq} from '../util/midi';
import {scale} from '../util/scale';
import {NoteNode} from './NoteGraph';
import {Sprite} from './Sprite';

interface MicrophoneParams {
  noteNodes: Set<NoteNode>;
}

export class Microphone extends Sprite {
  // Variables
  private position: IPosition | undefined;

  // Constants
  private readonly noteNodes = new Set<NoteNode>();
  private readonly color = 'white';
  private readonly maxDistance = 600;

  constructor(params: MicrophoneParams) {
    super();
    this.noteNodes = params.noteNodes;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {position} = this;
    if (!position) {
      return;
    }

    const {x, y} = position;
    const size = 20;

    // Draw the circle
    canvas.beginPath();
    canvas.arc(x, y, size, 0, 2 * Math.PI);
    canvas.fillStyle = this.color;
    canvas.fill();
    canvas.closePath();

    // Play the audio
    this.noteNodes.forEach((noteNode: NoteNode) => {
      const {note, position: nodePosition, synth} = noteNode;
      const freq = midiNoteToFreq(note);
      const distanceToNode = distanceBetween(position, nodePosition);
      const volume = scale({
        input: distanceToNode,
        inputMin: 0,
        inputMax: this.maxDistance,
        outputMin: 0,
        outputMax: -100,
        logarithmic: true
      });
      synth.volume.value = volume;
      synth.triggerAttack(freq);
    });
  }

  public tick(world: WorldState): void {
    const {mouseClickLocation} = world;
    if (mouseClickLocation) {
      this.position = mouseClickLocation;
    }
  }
}
