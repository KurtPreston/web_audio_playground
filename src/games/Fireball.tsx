import {autobind} from 'core-decorators';
import React from 'react';
import {Ryu} from '../sprites/Ryu';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {AudioAnalyser} from '../util/AudioAnalyser';

export interface FireballProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface FireballState {}

@autobind
export class Fireball extends React.Component<FireballProps, FireballState> {
  private readonly player: Ryu;
  private readonly sprites: Sprite[];
  private readonly audioAnalyser: AudioAnalyser;
  private gameLoop: NodeJS.Timeout | undefined;

  constructor(props: FireballProps) {
    super(props);
    this.audioAnalyser = new AudioAnalyser(props.audioSource);
    this.player = new Ryu(props);
    this.sprites = [this.player];
  }

  public componentDidMount() {
    this.runGame();
  }

  private runGame() {
    this.setState(
      {
        paused: false
      },
      () => {
        this.gameLoop = setInterval(this.tick, 25);
      }
    );
  }

  private pauseGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = undefined;
    }
    this.setState({
      paused: true
    });
  }

  public render() {
    const {width, height} = this.props.dimensions;

    const world: WorldState = this.world();

    return (
      <svg height={height} width={width}>
        {this.sprites.map((s) => s.render(world))}
      </svg>
    );
  }

  private world(): WorldState {
    return {
      dimensions: this.props.dimensions,
      audio: this.audioAnalyser
    };
  }

  private tick() {
    this.audioAnalyser.reset();
    const world: WorldState = this.world();
    this.sprites.forEach((s) => s.tick(world));
    this.forceUpdate();
  }
}
