import {random} from 'lodash';
import {midiNoteToFreq} from '../audio/midi';
import headphoneWamdag from '../images/headphoneWamdag.svg';
import {OverflowMode, scale} from '../math/scale';
import {angleBetween} from '../math/trig/angleBetween';
import {distanceBetween} from '../math/trig/distanceBetween';
import {IPosition, WorldState} from '../types';
import {NoteNode} from './NoteGraph';
import {Sprite} from './Sprite';

interface MicrophoneParams {
  noteNodes: Set<NoteNode>;
}

const headphoneWamdagImage = new Image();
headphoneWamdagImage.src = headphoneWamdag;

type DopplerType = 'none' | 'doppler' | 'invert';

export class Microphone extends Sprite {
  // Variables
  private position: IPosition | undefined;

  // Constants
  private readonly noteNodes = new Set<NoteNode>();
  private readonly color = 'white';
  private readonly maxDistance = 600;

  // Doppler settings
  private speedOfSound: number = Math.pow(2, random(2, 16));
  private doppler: DopplerType =
    Math.random() < 0.4 ? 'none' : Math.random() < 0.7 ? 'doppler' : 'invert';

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

    // Draw the circle
    const circleSize = 80;
    canvas.beginPath();
    canvas.arc(x, y, circleSize, 0, 2 * Math.PI);
    canvas.fillStyle = this.color;
    canvas.fill();
    canvas.closePath();

    // Draw the wamdag
    const wamSize = 100;
    canvas.drawImage(headphoneWamdagImage, x - wamSize / 2, y - wamSize / 2, wamSize, wamSize);

    // Play the audio
    this.noteNodes.forEach((noteNode: NoteNode) => {
      const {note, position: nodePosition, synth, panVol, vector} = noteNode;
      const {xMomentum, yMomentum} = vector;
      const freq = midiNoteToFreq(note);
      const distanceToNode = distanceBetween(position, nodePosition);
      const trajectoryAngle = angleBetween({x: 0, y: 0}, {x: xMomentum, y: yMomentum});
      const angleToNode = angleBetween(nodePosition, position);
      const angleDiff = trajectoryAngle - angleToNode;
      const velocity = Math.sqrt(Math.pow(xMomentum, 2) + Math.pow(yMomentum, 2));
      const velocityTowardNode = Math.cos(angleDiff) * velocity;
      let adjustedFreq =
        this.doppler === 'invert'
          ? (freq * this.speedOfSound) / Math.max(this.speedOfSound - velocityTowardNode, 1)
          : this.doppler === 'doppler'
          ? (freq * Math.max(this.speedOfSound - velocityTowardNode, 0)) / this.speedOfSound
          : freq;

      // Apply freq bounds
      if (adjustedFreq < 0) {
        adjustedFreq = 0;
      } else if (adjustedFreq > world.audio.sampleRate) {
        adjustedFreq = world.audio.sampleRate;
      }

      adjustedFreq = freq;

      const volume = scale({
        input: distanceToNode,
        inputMin: 0,
        inputMax: this.maxDistance,
        outputMin: -10,
        outputMax: -75,
        logarithmic: 4,
        overflowMode: OverflowMode.Constrain
      });
      panVol.volume.value = volume;
      panVol.pan.value = Math.cos(angleToNode) * -1;
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
