import {Player, Transport} from 'tone';
import {Dimensions, WorldState} from '../../types/State';
import {Microphone} from '../Microphone/Microphone';
import {Sprite} from '../Sprite';
import {WanderingBeat} from './WanderingBeat';

interface BeatSequencerParams {
  dimensions: Dimensions;
  mic: Microphone;
}

export class BeatSequencer implements Sprite {
  private readonly beats: WanderingBeat[];

  constructor(params: BeatSequencerParams) {
    const {dimensions, mic} = params;

    // Kick
    const kick = new Player('/samples/kick.wav');

    // Snare
    const snare = new Player('/samples/snare.wav');

    // Hat
    const hat = new Player('/samples/hihat.wav');
    hat.playbackRate = 2;

    // Create wandering beats
    const kickWanderer = new WanderingBeat({
      sample: kick,
      pattern: '4n',
      dimensions,
      fireworkSize: 50,
      fireworkColor: 'white',
      mic
    });
    const hatWanderer = new WanderingBeat({
      sample: hat,
      pattern: '8n',
      dimensions,
      fireworkSize: 15,
      fireworkColor: 'cyan',
      mic
    });
    const snareWanderer = new WanderingBeat({
      sample: snare,
      pattern: '2n',
      dimensions,
      fireworkSize: 35,
      fireworkColor: 'turquoise',
      mic
    });
    this.beats = [kickWanderer, hatWanderer, snareWanderer];

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
}
