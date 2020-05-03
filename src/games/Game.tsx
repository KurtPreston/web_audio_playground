import {autobind} from 'core-decorators';
import React from 'react';
import {Sprite} from '../sprites/Sprite';
import {DeviceOrientation, Dimensions, WorldState} from '../types';
import {AudioAnalyser} from '../util/AudioAnalyser';

export interface GameProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

@autobind
export abstract class Game<TState> extends React.Component<GameProps, TState> {
  protected abstract menu(world: WorldState): React.ReactNode;
  protected abstract sprites(): Sprite[];

  private readonly keysDown = new Set<string>();
  private readonly keysPressedThisFrame = new Set<string>();
  private gameLoop: NodeJS.Timeout | undefined;
  private readonly audioAnalyser: AudioAnalyser;
  private deviceOrientation: DeviceOrientation | undefined;

  constructor(props: GameProps) {
    super(props);
    this.audioAnalyser = new AudioAnalyser(props.audioSource);
  }

  public componentDidMount() {
    this.runGame();
    window.document.addEventListener('keydown', this.onKeyDown);
    window.document.addEventListener('keyup', this.onKeyUp);
    window.document.addEventListener('keypress', this.onKeyPress);
    window.addEventListener('deviceorientation', this.onDeviceOrientation, false);
  }

  public componentWillUnmount() {
    window.document.removeEventListener('keydown', this.onKeyDown);
    window.document.removeEventListener('keyup', this.onKeyUp);
    window.document.removeEventListener('keypress', this.onKeyPress);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);
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
        {this.menu(world)}
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

  // Override in subclasses
  protected onKeyDown(event: KeyboardEvent) {
    this.keysDown.add(event.key);
  }

  protected onKeyUp(event: KeyboardEvent) {
    this.keysDown.delete(event.key);
  }

  protected onKeyPress(event: KeyboardEvent) {
    this.keysPressedThisFrame.add(event.key);
  }

  protected onDeviceOrientation(event: DeviceOrientationEvent) {
    this.deviceOrientation = event;
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

    // Clear out key presses
    this.keysPressedThisFrame.clear();

    // Re-render
    this.forceUpdate();
  }

  protected world(): WorldState {
    return {
      dimensions: this.props.dimensions,
      audio: this.audioAnalyser,
      keysDown: this.keysDown,
      keysPressedThisFrame: this.keysPressedThisFrame,
      deviceOrientation: this.deviceOrientation
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
