import {autobind} from 'core-decorators';
import {each, random, sample} from 'lodash';
import {MonoSynth, Player} from 'tone';
import {Time} from 'tone/build/esm/core/type/Units';
import {Chord} from '../../audio/chords';
import {midiNoteToFreq} from '../../audio/midi';
import {Note} from '../../audio/Note';
import {randomSustainSynth} from '../../audio/oscillators';
import {Sequencer} from '../../audio/Sequencer/Sequencer';
import {Dimensions, WorldState} from '../../types/State';
import {randomColor} from '../../util/color';
import {Microphone} from '../Microphone/Microphone';
import {noteColor} from '../renderHelpers/noteColor';
import {Sprite} from '../Sprite';
import {Pattern, WanderingBeat} from './WanderingBeat';
import {WanderingBeatCollection} from './WanderingBeatCollection.generated';

interface WanderingBeatParams {
  dimensions: Dimensions;
  mic: Microphone;
}

type WanderingBeatType = keyof WanderingBeatCollection;

export interface WanderingBeatFactoryParams extends WanderingBeatParams {
  sequencer: Sequencer;
  collection: WanderingBeatCollection;
}

@autobind
export class WanderingBeatFactory implements Sprite {
  private readonly beats = new Map<WanderingBeatType, Set<WanderingBeat>>();
  private readonly unsubscribeFromSequencer: () => void;
  private readonly mic: Microphone;
  private dimensions: Dimensions;
  private currentChord: Chord | undefined;
  private factories: {
    [key in WanderingBeatType]: (params: WanderingBeatParams) => WanderingBeat;
  } = {
    kickWanderers: this.createKickWanderer,
    hatWanderers: this.createHatWanderer,
    bassWanderers: this.createBassWanderer,
    melodyWanderers: this.createMelodyWanderer,
    snareWanderers: this.createSnareWanderer
  };

  constructor(params: WanderingBeatFactoryParams) {
    this.mic = params.mic;
    this.dimensions = params.dimensions;

    // Create wanderers
    this.setCollection(params.collection);

    // Subscrube to sequencer
    this.unsubscribeFromSequencer = params.sequencer.subscribe((chord: Chord) => {
      this.currentChord = chord;
    });
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.beats.forEach((beatSet: Set<WanderingBeat>) => {
      beatSet.forEach((beat: WanderingBeat) => {
        beat.render(canvas, world);
      });
    });
  }

  public tick(world: WorldState) {
    this.dimensions = world.dimensions;

    // Advance beat frames
    this.beats.forEach((beatSet: Set<WanderingBeat>) => {
      beatSet.forEach((beat: WanderingBeat) => {
        beat.tick(world);
      });
    });
  }

  public setCollection(collection: WanderingBeatCollection) {
    each(collection, (numWanderers: number, wandererType: string) => {
      const type: WanderingBeatType = wandererType as WanderingBeatType;
      const factory = this.factories[type];
      if (!factory) {
        // Some unrelated prop included in the collection object (i.e. noteGraph)
        return;
      }

      if (!this.beats.has(type)) {
        this.beats.set(type, new Set<WanderingBeat>());
      }

      const set = this.beats.get(type) as Set<WanderingBeat>;
      while (set.size > numWanderers) {
        const beatToDelete: WanderingBeat = set.values().next().value;
        beatToDelete.destroy();
        set.delete(beatToDelete);
      }

      while (set.size < numWanderers) {
        const factory = this.factories[type];
        if (!factory) {
          continue;
        }
        const beat = factory({
          mic: this.mic,
          dimensions: this.dimensions
        });
        set.add(beat);
      }
    });
  }

  private createDrumWanderer(
    params: WanderingBeatParams & {
      sample: Player;
      playbackRate: number;
      fireworkSize: number;
      pattern: Pattern;
    }
  ): WanderingBeat {
    const {playbackRate, sample} = params;
    return new WanderingBeat({
      sourceAudio: {
        source: sample,
        trigger: (time): boolean => {
          if (sample.loaded) {
            sample.start(time);
            return true;
          } else {
            return false;
          }
        },
        pitchBend: (ratio: number) => {
          sample.playbackRate = playbackRate * ratio;
        }
      },
      shipSize: 3,
      pattern: params.pattern,
      dimensions: params.dimensions,
      fireworkSize: params.fireworkSize,
      fireworkColor: randomColor(),
      mic: params.mic
    });
  }

  private createKickWanderer(params: WanderingBeatParams): WanderingBeat {
    const kick = new Player('/samples/kick.wav');
    return this.createDrumWanderer({
      ...params,
      sample: kick,
      playbackRate: 1,
      fireworkSize: 50,
      pattern: {
        frequency: '1m',
        times: ['+0:0']
      }
    });
  }

  private createSnareWanderer(params: WanderingBeatParams): WanderingBeat {
    const snare = new Player('/samples/snare.wav');
    snare.volume.value = -5;
    return this.createDrumWanderer({
      ...params,
      sample: snare,
      playbackRate: 1,
      fireworkSize: 50,
      pattern: {
        frequency: '1m',
        times: ['+0:1', '+0:3']
      }
    });
  }

  private createHatWanderer(params: WanderingBeatParams): WanderingBeat {
    const hat = new Player('/samples/hihat.wav');
    hat.volume.value = -10;
    hat.playbackRate = 4;
    return this.createDrumWanderer({
      ...params,
      sample: hat,
      playbackRate: 4,
      fireworkSize: 15,
      pattern: {
        frequency: '8n',
        times: ['+0:0']
      }
    });
  }

  private createInstrumentWanderer(
    params: WanderingBeatParams & {
      pattern: Pattern;
      noteDuration: Time;
      shipSize: number;
      fireworkSize: number;
      nextNote: () => Note | undefined;
    }
  ): WanderingBeat {
    const instrument = new MonoSynth(randomSustainSynth());
    let note: Note | undefined;
    let freq: number | undefined;
    return new WanderingBeat({
      sourceAudio: {
        source: instrument,
        trigger: (time: Time): boolean => {
          note = params.nextNote();
          if (note) {
            freq = midiNoteToFreq(note);
            try {
              instrument.triggerAttackRelease(freq, params.noteDuration, time);
              return true;
            } catch (e) {
              console.error(e);
              return false;
            }
          } else {
            return false;
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
      fireworkSize: params.fireworkSize,
      shipSize: params.shipSize,
      mic: params.mic,
      fireworkColor: (): string => {
        if (note) {
          return noteColor(note);
        } else {
          return 'white';
        }
      }
    });
  }

  private createMelodyWanderer(params: WanderingBeatParams): WanderingBeat {
    return this.createInstrumentWanderer({
      ...params,
      pattern: {
        frequency: '16n',
        times: ['+0']
      },
      noteDuration: '8n',
      fireworkSize: 20,
      shipSize: 0,
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

  private createBassWanderer(params: WanderingBeatParams): WanderingBeat {
    const octave = random(2, 3);
    return this.createInstrumentWanderer({
      ...params,
      fireworkSize: 200,
      pattern: {
        frequency: '4n',
        times: ['+0:0']
      },
      noteDuration: '4n',
      shipSize: 0,
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
