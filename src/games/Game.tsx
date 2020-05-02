import {autobind} from 'core-decorators';
import React from 'react';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {AudioAnalyser} from '../util/AudioAnalyser';

export interface GameProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

@autobind
export abstract class Game<TState> extends React.Component<GameProps, TState> {
  protected abstract menu(): React.ReactNode;
  protected abstract sprites(): Sprite[];

  private gameLoop: NodeJS.Timeout | undefined;
  private readonly audioAnalyser: AudioAnalyser;

  constructor(props: GameProps) {
    super(props);
    this.audioAnalyser = new AudioAnalyser(props.audioSource);
  }

  public componentDidMount() {
    this.runGame();
  }

  public render(): React.ReactNode {
    const {height, width} = this.props.dimensions;

    const world: WorldState = this.world();

    const svg = (
      <svg height={height} width={width}>
        {this.sprites().map((s) => s.render(world))}
      </svg>
    );

    const menu = (
      <div className='controls'>
        {this.menu()}
        {this.renderPauseBtn()}
      </div>
    );

    return (
      <div className='game'>
        {svg}
        {menu}
      </div>
    );
  }

  private renderPauseBtn() {
    if (!this.gameLoop) {
      return <button onClick={this.runGame}>Start</button>;
    } else {
      return <button onClick={this.pauseGame}>Pause</button>;
    }
  }

  private tick() {
    // Reset audio analysis
    this.audioAnalyser.reset();

    // Update sprites
    const sprites = this.sprites();
    const world = this.world();
    sprites.forEach((sprite) => sprite.tick(world));

    // Re-render
    this.forceUpdate();
  }

  private world(): WorldState {
    return {
      dimensions: this.props.dimensions,
      audio: this.audioAnalyser
    };
  }

  private runGame() {
    if (!this.gameLoop) {
      this.gameLoop = setInterval(this.tick, 25);
      this.forceUpdate();
    }
  }

  private pauseGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = undefined;
      this.forceUpdate();
    }
  }
}
