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
    snare.volume.value = -10;

    // Hat
    const hat = new Player('/samples/hihat.wav');
    hat.playbackRate = 2;
    hat.volume.value = -20;

    // Create wandering beats
    const kickWanderer = new WanderingBeat({
      sample: kick,
      pattern: '4n',
      dimensions,
      fireworkSize: 50,
      fireworkColor: 'white',
      mic
    });
    // const hatWanderer = new WanderingBeat({
    //   sample: hat,
    //   pattern: '8n',
    //   dimensions,
    //   fireworkSize: 15,
    //   fireworkColor: 'cyan'
    // });
    // const snareWanderer = new WanderingBeat({
    //   sample: snare,
    //   pattern: '2n',
    //   dimensions,
    //   fireworkSize: 35,
    //   fireworkColor: 'turquoise'
    // });
    // this.beats = [kickWanderer, hatWanderer, snareWanderer];
    this.beats = [kickWanderer];

    // Set-up microphones
    // const kickMic = new SpriteMicrophone({
    //   audioSettings: params.audioSettings,
    //   audioSource: kick,
    //   channel,
    //   sourcePosition: () => kickWanderer.head,
    //   micPosition: () => astronaut.traveler.position
    // });
    // kick.connect(kickMic.channel);

    // const hatMic = new SpriteMicrophone({
    //   audioSettings: params.audioSettings,
    //   audioSource: hat,
    //   channel,
    //   sourcePosition: () => hatWanderer.head,
    //   micPosition: () => astronaut.traveler.position
    // });
    // hat.connect(hatMic.channel);

    // const snareMic = new SpriteMicrophone({
    //   audioSettings: params.audioSettings,
    //   audioSource: hat,
    //   channel,
    //   sourcePosition: () => snareWanderer.head,
    //   micPosition: () => astronaut.traveler.position
    // });
    // snare.connect(snareMic.channel);
    // this.mics = [kickMic, hatMic, snareMic];
    // this.mics = [kickMic];

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
