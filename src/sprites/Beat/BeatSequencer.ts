import {Player, ToneAudioNode, Transport} from 'tone';
import {Dimensions, WorldState} from '../../types/State';
import {Sprite} from '../Sprite';
import {WanderingBeat} from './WanderingBeat';

interface BeatSequencerParams {
  dimensions: Dimensions;
  channel: ToneAudioNode;
}

export class BeatSequencer implements Sprite {
  private readonly beats: WanderingBeat[];

  constructor(params: BeatSequencerParams) {
    const {dimensions, channel} = params;

    // Kick
    const kick = new Player('/samples/kick.wav');
    kick.volume.value = -10;
    kick.connect(channel);

    // Snare
    const snare = new Player('/samples/snare.wav');
    snare.volume.value = -10;
    snare.connect(channel);

    // Hat
    const hat = new Player('/samples/hihat.wav');
    hat.playbackRate = 2;
    hat.volume.value = -20;
    hat.connect(channel);

    // Create wandering beats
    this.beats = [
      new WanderingBeat({
        sample: kick,
        pattern: '4n',
        dimensions,
        fireworkSize: 50,
        fireworkColor: 'white'
      }),
      new WanderingBeat({
        sample: snare,
        pattern: '2n',
        dimensions,
        fireworkSize: 50,
        fireworkColor: 'turqoise'
      }),
      new WanderingBeat({
        sample: hat,
        pattern: '8n',
        dimensions,
        fireworkSize: 15,
        fireworkColor: 'cyan'
      })
    ];

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
