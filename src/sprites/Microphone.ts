import {autobind} from 'core-decorators';
import {sample} from 'lodash';
import {FeedbackDelay, Reverb, Synth, ToneAudioNode} from 'tone';
import {midiNoteToFreq} from '../audio/midi';
import {Note} from '../audio/Note';
import {pingOscillator} from '../audio/oscillators';
import headphoneWamdag from '../images/astroWamdag.svg';
import {doppler} from '../math/physics/doppler';
import {OverflowMode, scale} from '../math/scale';
import {BounceOffEdge, IForce} from '../math/traveler/forces';
import {updateTraveler} from '../math/traveler/updateTraveler';
import {angleBetween} from '../math/trig/angleBetween';
import {distanceBetween} from '../math/trig/distanceBetween';
import {DopplerMode, DopplerSettings} from '../types/DopplerSettings.d';
import {ITraveler, WorldState} from '../types/State';
import {NoteNode} from './NoteGraph';
import {circularPath} from './renderHelpers/circularPath';
import {drawRotated} from './renderHelpers/drawRotated';
import {Sprite} from './Sprite';

interface MicrophoneParams {
  getNoteNodes: () => Set<NoteNode>;
  channel: ToneAudioNode;
}

const headphoneWamdagImage = new Image();
headphoneWamdagImage.src = headphoneWamdag;

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
  public dopplerSettings: DopplerSettings;
  private bounceSynth: Synth;
  private bounceFill: number = 0;

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
    this.dopplerSettings = {
      mode: DopplerMode.On,
      speedOfSound: 3000
    };

    // Create synth
    this.bounceSynth = new Synth(pingOscillator);
    this.bounceSynth.volume.value = -5;
    const delay = new FeedbackDelay(0.4, 0.5);
    const reverb = new Reverb(5);
    this.bounceSynth.connect(delay);
    this.bounceSynth.connect(reverb);
    delay.connect(reverb);
    reverb.connect(params.channel);
  }

  @autobind
  public updateDopplerSettings(value: DopplerSettings) {
    this.dopplerSettings = value;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {angle, dopplerSettings} = this;
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
        canvas.fillStyle = `rgba(255, 255, 255, ${this.bounceFill})`;
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
      const {note, synth, panVol} = noteNode;
      const freq = midiNoteToFreq(note);
      const angleToNode = angleBetween(noteNode.position, position);
      const distanceToNode = distanceBetween(position, noteNode.position);

      let adjustedFreq = dopplerSettings
        ? doppler({
            source: {
              freq,
              position: noteNode.position,
              vector: noteNode.vector
            },
            target: {
              position: this.traveler.position,
              vector: this.traveler.vector
            },
            settings: dopplerSettings
          })
        : freq;

      // Apply freq bounds
      if (adjustedFreq < 0) {
        adjustedFreq = 0;
      } else if (adjustedFreq > world.audio.sampleRate) {
        adjustedFreq = world.audio.sampleRate;
      }

      const volume = scale({
        input: distanceToNode,
        inputMin: 0,
        inputMax: this.maxDistance,
        outputMin: -4,
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

    updateTraveler(this.traveler, [this.bounceOffEdgeWithSound], world);

    this.angle += this.angularMomentum;
    this.bounceFill *= 0.9;
  }

  private bounceOffEdgeWithSound: IForce = (traveler: ITraveler, world: WorldState) => {
    return BounceOffEdge(traveler, world, () => this.onBounce());
  };

  private onBounce() {
    this.bounceFill = 1;
    const node: NoteNode = sample(Array.from(this.getNoteNodes())) as NoteNode;
    const note: Note = node.note % 12;
    const freq = midiNoteToFreq(note + 72);
    this.bounceSynth.triggerAttackRelease(freq, 0.125);
  }
}
