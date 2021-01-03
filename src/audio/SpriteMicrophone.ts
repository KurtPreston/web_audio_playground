import {PanVol, ToneAudioNode} from 'tone';
import {Source} from 'tone/build/esm/source/Source';
import {OverflowMode, scale} from '../math/scale';
import {angleBetween} from '../math/trig/angleBetween';
import {distanceBetween} from '../math/trig/distanceBetween';
import {MicrophoneAudioSettings} from '../sprites/Microphone/MicrophoneAudioSettings.generated';
import {IPosition} from '../types/State';

export interface SpriteMicrophoneParams {
  audioSource: Source<any>;
  channel: ToneAudioNode;
  audioSettings: MicrophoneAudioSettings;
  sourcePosition: () => IPosition;
  micPosition: () => IPosition;
}

export class SpriteMicrophone {
  private readonly panVol: PanVol;

  private readonly sourcePosition: () => IPosition;
  private readonly micPosition: () => IPosition;
  private readonly audioSettings: MicrophoneAudioSettings;

  constructor(params: SpriteMicrophoneParams) {
    // Store params
    this.sourcePosition = params.sourcePosition;
    this.micPosition = params.micPosition;
    this.audioSettings = params.audioSettings;

    // Audio
    this.panVol = new PanVol();
    this.panVol.connect(params.channel);
    params.audioSource.connect(this.panVol);
  }

  public get channel(): ToneAudioNode {
    return this.panVol;
  }

  public tick() {
    // Panning
    const angleToNode = angleBetween(this.sourcePosition(), this.micPosition());
    this.panVol.pan.rampTo(Math.cos(angleToNode) * -1);

    // Volume
    const distanceToNode = distanceBetween(this.sourcePosition(), this.micPosition());
    const volume = scale({
      input: distanceToNode,
      inputMin: 0,
      inputMax: this.audioSettings.maxAudibleDistance,
      outputMin: 0,
      outputMax: -35,
      logarithmic: 5,
      overflowMode: OverflowMode.Constrain
    });
    this.panVol.volume.rampTo(volume);
  }
}
