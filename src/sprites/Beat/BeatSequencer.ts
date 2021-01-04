import {random, sample, times} from 'lodash';
import {MonoSynth, Player, Transport} from 'tone';
import {Subdivision} from 'tone/build/esm/core/type/Units';
import {midiNoteToFreq} from '../../audio/midi';
import {Note, NoteValue} from '../../audio/Note';
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
    hat.playbackRate = 4;

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
          hat.playbackRate = ratio * 4;
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

    times(3, () => this.createBassWanderer(params));
    times(6, () => this.createMelodyWanderer(params));

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

  private createInstrumentWanderer(
    params: BeatSequencerParams & {
      pattern: Subdivision;
      nextNote: () => Note | undefined;
    }
  ) {
    const instrument = new MonoSynth(randomSustainSynth());
    let freq: number | undefined;
    const bassWanderer = new WanderingBeat({
      sourceAudio: {
        source: instrument,
        trigger: (time: number) => {
          const note = params.nextNote();
          if (note) {
            freq = midiNoteToFreq(note);
            try {
              instrument.triggerAttackRelease(freq, params.pattern, time);
            } catch (e) {
              console.error(e);
            }
          }
        },
        pitchBend: (ratio: number): void => {
          if (freq) {
            instrument.frequency.value = freq * ratio;
          }
        }
      },
      pattern: params.pattern,
      dimensions: params.dimensions,
      fireworkSize: 55,
      mic: params.mic
    });

    this.beats.push(bassWanderer);
  }

  private createMelodyWanderer(params: BeatSequencerParams) {
    this.createInstrumentWanderer({
      ...params,
      pattern: '16n',
      nextNote: () => {
        const notes: Set<NoteValue> = params.getNotes();
        const noteValue = sample(Array.from(notes));
        if (noteValue) {
          const note: Note = noteValue + 12 * random(4, 6);
          return note;
        }
      }
    });
  }

  private createBassWanderer(params: BeatSequencerParams) {
    this.createInstrumentWanderer({
      ...params,
      pattern: '4n',
      nextNote: () => {
        const notes: Set<NoteValue> = params.getNotes();
        const noteValue = sample(Array.from(notes));
        if (noteValue) {
          const note: Note = noteValue + 12 * random(2, 4);
          return note;
        }
      }
    });
  }
}
