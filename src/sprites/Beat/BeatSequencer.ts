import {random, sample, times} from 'lodash';
import {MonoSynth, Player, Transport} from 'tone';
import {Subdivision} from 'tone/build/esm/core/type/Units';
import {Chord} from '../../audio/chords';
import {midiNoteToFreq} from '../../audio/midi';
import {Note} from '../../audio/Note';
import {randomSustainSynth} from '../../audio/oscillators';
import {Sequencer} from '../../audio/Sequencer';
import {Dimensions, WorldState} from '../../types/State';
import {randomColor} from '../../util/color';
import {Microphone} from '../Microphone/Microphone';
import {noteColor} from '../renderHelpers/noteColor';
import {Sprite} from '../Sprite';
import {WanderingBeat} from './WanderingBeat';

interface BeatSequencerParams {
  dimensions: Dimensions;
  mic: Microphone;
  sequencer: Sequencer;
}

export class BeatSequencer implements Sprite {
  private readonly beats: Set<WanderingBeat> = new Set<WanderingBeat>();
  private readonly unsubscribeFromSequencer: () => void;
  private currentChord: Chord | undefined;

  constructor(params: BeatSequencerParams) {
    // Create wandderers
    times(1, () => this.createSnareWanderer(params));
    times(1, () => this.createHatWanderer(params));
    times(3, () => this.createKickWanderer(params));
    times(4, () => this.createBassWanderer(params));
    times(5, () => this.createMelodyWanderer(params));

    // Subscrube to sequencer
    this.unsubscribeFromSequencer = params.sequencer.subscribe((chord: Chord) => {
      this.currentChord = chord;
    });
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

  private createDrumWanderer(
    params: BeatSequencerParams & {
      sample: Player;
      playbackRate: number;
      fireworkSize: number;
      pattern: Subdivision;
    }
  ) {
    const {playbackRate, sample} = params;
    const drumWanderer = new WanderingBeat({
      sourceAudio: {
        source: sample,
        trigger: (time) => {
          if (sample.loaded) {
            sample.start(time);
          }
        },
        pitchBend: (ratio: number) => {
          sample.playbackRate = playbackRate * ratio;
        }
      },
      pattern: params.pattern,
      dimensions: params.dimensions,
      fireworkSize: params.fireworkSize,
      fireworkColor: randomColor(),
      mic: params.mic
    });
    this.beats.add(drumWanderer);
  }

  private createKickWanderer(params: BeatSequencerParams) {
    const kick = new Player('/samples/kick.wav');
    this.createDrumWanderer({
      ...params,
      sample: kick,
      playbackRate: 1,
      fireworkSize: 50,
      pattern: '4n'
    });
  }

  private createSnareWanderer(params: BeatSequencerParams) {
    const snare = new Player('/samples/snare.wav');
    snare.volume.value = -5;
    this.createDrumWanderer({
      ...params,
      sample: snare,
      playbackRate: 1,
      fireworkSize: 50,
      pattern: '2n'
    });
  }

  private createHatWanderer(params: BeatSequencerParams) {
    const hat = new Player('/samples/hihat.wav');
    hat.volume.value = -10;
    hat.playbackRate = 4;
    this.createDrumWanderer({
      ...params,
      sample: hat,
      playbackRate: 4,
      fireworkSize: 15,
      pattern: '8n'
    });
  }

  private createInstrumentWanderer(
    params: BeatSequencerParams & {
      pattern: Subdivision;
      nextNote: () => Note | undefined;
    }
  ) {
    const instrument = new MonoSynth(randomSustainSynth());
    let note: Note | undefined;
    let freq: number | undefined;
    const bassWanderer = new WanderingBeat({
      sourceAudio: {
        source: instrument,
        trigger: (time: number) => {
          note = params.nextNote();
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
      mic: params.mic,
      fireworkColor: (): string => {
        if (note) {
          return noteColor(note);
        } else {
          return 'white';
        }
      }
    });

    this.beats.add(bassWanderer);
  }

  private createMelodyWanderer(params: BeatSequencerParams) {
    this.createInstrumentWanderer({
      ...params,
      pattern: '16n',
      nextNote: () => {
        if (this.currentChord) {
          const noteValue = sample(Array.from(this.currentChord.notes));
          if (noteValue) {
            // && Math.random() > 0.5) {
            const note: Note = noteValue + 12 * random(4, 6);
            return note;
          }
        }
      }
    });
  }

  private createBassWanderer(params: BeatSequencerParams) {
    const octave = random(2, 3);
    this.createInstrumentWanderer({
      ...params,
      pattern: '4n',
      nextNote: () => {
        if (this.currentChord) {
          const noteValue = this.currentChord.root;
          if (noteValue) {
            const note: Note = noteValue + 12 * octave;
            return note;
          }
        }
      }
    });
  }
}
