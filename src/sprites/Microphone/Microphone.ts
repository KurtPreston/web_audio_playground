// A microphone allows audio to be heard as if there were a microphone on screen.
// It combines three acoustic simulations:
// 1. Volume: louder when closer, quieter when further
// 2. Panning: sound is left or right, depending on position
// 3: PitchShift: simulated doppler effect

import {ToneAudioNode} from 'tone';
import {ITraveler} from '../../types/State';
import {MicrophoneAudioSettings} from './MicrophoneAudioSettings.generated';
import {MicrophoneConnection} from './MicrophoneConnection';

export interface SpriteMicrophoneParams {
  channel: ToneAudioNode;
  audioSettings: MicrophoneAudioSettings;
  micPosition: () => ITraveler;
}

export interface SpriteSoundSource {
  sourceAudio: ToneAudioNode;
  sourcePosition: () => ITraveler;
  pitchBend: (ratio: number) => void;
}

export class Microphone {
  private readonly micPosition: () => ITraveler;
  public readonly audioSettings: MicrophoneAudioSettings;
  private readonly connections: Set<MicrophoneConnection>;
  private readonly channel: ToneAudioNode;

  constructor(params: SpriteMicrophoneParams) {
    // Store params
    this.micPosition = params.micPosition;
    this.audioSettings = params.audioSettings;
    this.channel = params.channel;

    // Create connections
    this.connections = new Set<MicrophoneConnection>();
  }

  public connect(source: SpriteSoundSource): MicrophoneConnection {
    const connection = new MicrophoneConnection({
      sourceAudio: source.sourceAudio,
      sourcePosition: source.sourcePosition,
      audioSettings: this.audioSettings,
      micPosition: this.micPosition,
      channel: this.channel,
      pitchBend: source.pitchBend
    });
    this.connections.add(connection);
    return connection;
  }

  public destroy() {
    this.connections.forEach((connection) => connection.destroy());
  }
}
