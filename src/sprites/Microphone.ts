import {random} from 'lodash';
import {midiNoteToFreq} from '../audio/midi';
import headphoneWamdag from '../images/astroWamdag.svg';
import {doppler} from '../math/physics/doppler';
import {OverflowMode, scale} from '../math/scale';
import {BounceOffEdge} from '../math/traveler/forces';
import {updateTraveler} from '../math/traveler/updateTraveler';
import {angleBetween} from '../math/trig/angleBetween';
import {distanceBetween} from '../math/trig/distanceBetween';
import {ITraveler, WorldState} from '../types';
import {NoteNode} from './NoteGraph';
import {circularPath} from './renderHelpers/circularPath';
import {drawRotated} from './renderHelpers/drawRotated';
import {Sprite} from './Sprite';

interface MicrophoneParams {
  getNoteNodes: () => Set<NoteNode>;
}

const headphoneWamdagImage = new Image();
headphoneWamdagImage.src = headphoneWamdag;

type DopplerType = 'none' | 'doppler' | 'invert';

export class Microphone implements Sprite {
  // Variables
  private traveler: ITraveler;
  private angle: number = 0;
  private angularMomentum: number = 0.01;

  // Constants
  private readonly getNoteNodes: () => Set<NoteNode>;
  private readonly color = 'white';
  private readonly maxDistance = 600;

  // Doppler settings
  private speedOfSound: number = Math.pow(2, random(2, 16));
  private doppler: DopplerType =
    Math.random() < 0.4 ? 'none' : Math.random() < 0.7 ? 'doppler' : 'invert';

  constructor(params: MicrophoneParams) {
    this.traveler = {
      position: {
        x: 0,
        y: 0
      },
      vector: {
        xMomentum: 1,
        yMomentum: 1
      }
    };
    this.getNoteNodes = params.getNoteNodes;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {angle} = this;
    const {position} = this.traveler;
    if (!position) {
      return;
    }

    drawRotated({
      canvas,
      angle,
      position,
      draw: () => {
        // Draw the circle
        canvas.fillStyle = 'transparent';
        canvas.strokeStyle = this.color;
        canvas.lineWidth = 2;
        circularPath({
          canvas,
          wave: world.audio.uintWave,
          cx: 0,
          cy: 0,
          minSize: 40,
          maxSize: 100
        });

        // Draw the wamdag
        const wamSize = 100;
        canvas.drawImage(headphoneWamdagImage, -wamSize / 2, -wamSize / 2, wamSize, wamSize);
      }
    });

    // Play the audio
    const noteNodes = this.getNoteNodes();
    noteNodes.forEach((noteNode: NoteNode) => {
      const {note, synth, panVol, vector} = noteNode;
      const freq = midiNoteToFreq(note);
      const angleToNode = angleBetween(noteNode.position, position);
      const distanceToNode = distanceBetween(position, noteNode.position);

      let adjustedFreq = doppler({
        source: {
          freq,
          position: noteNode.position,
          vector: noteNode.vector
        },
        target: {
          position,
          vector
        },
        speedOfSound: this.speedOfSound
      });

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
        outputMin: -8,
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
      this.traveler = {
        position: mouseClickLocation,
        vector: {
          xMomentum: 0,
          yMomentum: 0
        }
      };
      this.angularMomentum = 0;
      this.angle = 0;
    }

    updateTraveler(this.traveler, [BounceOffEdge], world);

    this.angle += this.angularMomentum;
  }
}
