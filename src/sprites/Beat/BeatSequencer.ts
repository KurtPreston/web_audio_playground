import {sample, times} from 'lodash';
import {MonoSynth, Player, Transport} from 'tone';
import {midiNoteToFreq} from '../../audio/midi';
import {NoteValue} from '../../audio/Note';
import {randomSustainSynth} from '../../audio/oscillators';
import {Dimensions, WorldState} from '../../types/State';
import {randomColor} from '../../util/color';
import {Microphone} from '../Microphone/Microphone';
import {Sprite} from '../Sprite';
import {WanderingBeat} from './WanderingBeat';

interface BeatSequencerParams {
  dimensions: Dimensions;
  mic: Microphone;
  getNotes: () => Set<NoteValue>;
}

export class BeatSequencer implements Sprite {
  private readonly beats: WanderingBeat[];

  constructor(params: BeatSequencerParams) {
    // Load params
    const {dimensions, mic} = params;

    // Kick
    const kick = new Player('/samples/kick.wav');

    // Snare
    const snare = new Player('/samples/snare.wav');
    snare.volume.value = -5;

    // Hat
    const hat = new Player('/samples/hihat.wav');
    hat.volume.value = -10;
    hat.playbackRate = 2;

    // Create wandering beats
    const kickWanderer = new WanderingBeat({
      sourceAudio: {
        source: kick,
        trigger: (time) => {
          if (kick.loaded) {
            kick.start(time);
          }
        },
        pitchBend: (ratio: number) => {
          kick.playbackRate = ratio;
        }
      },
      pattern: '4n',
      dimensions,
      fireworkSize: 50,
      fireworkColor: randomColor(),
      mic
    });
    const hatWanderer = new WanderingBeat({
      sourceAudio: {
        source: hat,
        trigger: (time) => {
          if (hat.loaded) {
            hat.start(time);
          }
        },
        pitchBend: (ratio: number) => {
          hat.playbackRate = ratio;
        }
      },
      pattern: '8n',
      dimensions,
      fireworkSize: 15,
      mic
    });
    const snareWanderer = new WanderingBeat({
      sourceAudio: {
        source: snare,
        trigger: (time) => {
          if (snare.loaded) {
            snare.start(time);
          }
        },
        pitchBend: (ratio: number) => {
          snare.playbackRate = ratio;
        }
      },
      pattern: '2n',
      dimensions,
      fireworkSize: 35,
      mic
    });

    this.beats = [kickWanderer, hatWanderer, snareWanderer];

    times(4, () => this.createBassWanderer(params));

    // Start sequencer
    Transport.bpm.value = 80;
    Transport.start();
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.beats.forEach((beat: WanderingBeat) => {
      beat.render(canvas, world);
    });
  }

  public tick(world: WorldState) {
    // Advance beat frames
    this.beats.forEach((beat: WanderingBeat) => {
      beat.tick(world);
    });
  }

  private createBassWanderer(params: BeatSequencerParams) {
    const bass = new MonoSynth(randomSustainSynth());
    let freq: number | undefined;
    const bassWanderer = new WanderingBeat({
      sourceAudio: {
        source: bass,
        trigger: (time: number) => {
          const notes: Set<NoteValue> = params.getNotes();
          const noteValue = sample(Array.from(notes));
          if (noteValue) {
            const bassNote = noteValue + (sample([24, 36]) as number);
            freq = midiNoteToFreq(bassNote);
            try {
              bass.triggerAttackRelease(freq, '8n', time);
            } catch (e) {
              console.error(e);
            }
          }
        },
        pitchBend: (ratio: number): void => {
          if (freq) {
            bass.frequency.value = freq * ratio;
          }
        }
      },
      pattern: '4n',
      dimensions: params.dimensions,
      fireworkSize: 55,
      mic: params.mic
    });

    this.beats.push(bassWanderer);
  }
}
