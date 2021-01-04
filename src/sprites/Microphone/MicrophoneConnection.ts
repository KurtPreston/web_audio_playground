// Represents a connection between a sound-emitting ITraveler and an ITraveler mic

import {PanVol, ToneAudioNode} from 'tone';
import {Source} from 'tone/build/esm/source/Source';
import {doppler} from '../../math/physics/doppler';
import {OverflowMode, scale} from '../../math/scale';
import {angleBetween} from '../../math/trig/angleBetween';
import {distanceBetween} from '../../math/trig/distanceBetween';
import {IPosition, ITraveler, IVector} from '../../types/State';
import {MicrophoneAudioSettings} from './MicrophoneAudioSettings.generated';

export interface MicrophoneConnectionParams {
  sourceAudio: Source<any>;
  sourcePosition: () => ITraveler;
  audioSettings: MicrophoneAudioSettings;
  micPosition: () => ITraveler;
  channel: ToneAudioNode;
  pitchBend: (ratio: number) => void;
}

export class MicrophoneConnection {
  // Audio nodes
  private readonly pitchBend: (ratio: number) => void;
  private readonly panVol: PanVol;

  // Physics
  private readonly sourcePosition: () => ITraveler;
  private readonly micPosition: () => ITraveler;
  private readonly audioSettings: MicrophoneAudioSettings;

  constructor(params: MicrophoneConnectionParams) {
    const {sourceAudio, sourcePosition, audioSettings, micPosition, channel, pitchBend} = params;

    // Cache params
    this.micPosition = micPosition;
    this.sourcePosition = sourcePosition;
    this.pitchBend = pitchBend;
    this.audioSettings = audioSettings;

    // Create audio nodes
    this.panVol = new PanVol(0, -100);

    // Connect audio nodes
    sourceAudio.connect(this.panVol);
    this.panVol.connect(channel);

    // Start relational
    this.tick();
  }

  public tick() {
    const sourcePosition: IPosition = this.sourcePosition().position;
    const sourceVector: IVector = this.sourcePosition().vector;
    const micPosition: IPosition = this.micPosition().position;
    const micVector: IVector = this.micPosition().vector;

    // Panning
    const angleToNode = angleBetween(sourcePosition, micPosition);
    this.panVol.pan.rampTo(Math.cos(angleToNode) * -1);

    // Volume
    const distanceToNode = distanceBetween(sourcePosition, micPosition);
    const volume = scale({
      input: distanceToNode,
      inputMin: 0,
      inputMax: this.audioSettings.maxAudibleDistance,
      outputMin: this.audioSettings.maxVolume,
      outputMax: this.audioSettings.minVolume,
      logarithmic: this.audioSettings.distanceVolumeRolloff,
      overflowMode: OverflowMode.Constrain
    });
    this.panVol.volume.rampTo(volume);

    // Doppler
    const pitchShiftRatio = doppler({
      source: {
        position: sourcePosition,
        vector: sourceVector
      },
      target: {
        position: micPosition,
        vector: micVector
      },
      settings: this.audioSettings
    });
    this.pitchBend(pitchShiftRatio);
  }

  public async destroy() {
    const fadeOutTime = 1000;
    this.panVol.volume.rampTo(-200, fadeOutTime / 1000);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.panVol.dispose();
        resolve();
      });
    });
  }
}
