import {autobind} from 'core-decorators';
import {Channel, setContext} from 'tone';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph} from '../sprites/NoteGraph';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {WorldState} from '../types';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class DopplerSynthGame implements Game {
  public info = DopplerSynth;

  private readonly bg = new StaticBackground();
  private readonly noteGraph: NoteGraph;
  private readonly microphone: Microphone;

  constructor(world: WorldState, initializers: ResourceInitializers) {
    setContext(initializers.audioContext);
    const channel = new Channel();
    channel.toMaster();
    channel.connect(initializers.analyserNode);
    const {dimensions} = world;

    this.noteGraph = new NoteGraph({
      dimensions,
      channel
    });
    this.microphone = new Microphone({
      noteNodes: this.noteGraph.nodes
    });
  }

  public sprites(): Sprite[] {
    return [this.bg, this.microphone, this.noteGraph];
  }
}

export const DopplerSynth: GameInfo = {
  title: 'DopplerSynth',
  url: '/doppler',
  description: 'a synthesizier orbits in outer space.',
  dataSources: [],
  game: DopplerSynthGame
};
