import {angleBetween} from '../math/trig/angleBetween';
import {distanceBetween} from '../math/trig/distanceBetween';
import {IPosition, WorldState} from '../types';
import {midiNoteToFreq} from '../util/midi';
import {OverflowMode, scale} from '../util/scale';
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
  private readonly speedOfSound = 500;

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
      const {note, position: nodePosition, synth, vector} = noteNode;
      const {xMomentum, yMomentum} = vector;
      const freq = midiNoteToFreq(note);
      const distanceToNode = distanceBetween(position, nodePosition);
      const trajectoryAngle = angleBetween({x: 0, y: 0}, {x: xMomentum, y: yMomentum});
      const angleToNode = angleBetween(nodePosition, position);
      const angleDiff = trajectoryAngle - angleToNode;
      const velocity = Math.sqrt(Math.pow(xMomentum, 2) + Math.pow(yMomentum, 2));
      const velocityTowardNode = Math.cos(angleDiff) * velocity;
      const adjustedFreq =
        (freq * Math.max(this.speedOfSound - velocityTowardNode, 0)) / this.speedOfSound;
      const volume = scale({
        input: distanceToNode,
        inputMin: 0,
        inputMax: this.maxDistance,
        outputMin: 0,
        outputMax: -75,
        logarithmic: true,
        overflowMode: OverflowMode.Constrain
      });
      synth.volume.value = volume;
      synth.triggerAttack(adjustedFreq);
    });
  }

  public tick(world: WorldState): void {
    const {mouseClickLocation} = world;
    if (mouseClickLocation) {
      this.position = mouseClickLocation;
    }
  }
}
