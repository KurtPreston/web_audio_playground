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
  private frameNum: number = 0;
  private canvasCtx: CanvasRenderingContext2D | null = null;

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

    const menu = (
      <div className='controls'>
        {this.menu(world)}
        {this.renderPauseBtn()}
      </div>
    );

    return (
      <div className='game'>
        <canvas height={height} width={width} ref={this.canvasRefFn} />;{menu}
      </div>
    );
  }

  private canvasRefFn(ref: HTMLCanvasElement) {
    this.canvasCtx = ref?.getContext('2d');
    if (this.canvasCtx) {
      this.canvasCtx.globalCompositeOperation = 'normal';
      this.canvasCtx.save();
    }
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
    // Reset frame
    this.frameNum++;
    this.audioAnalyser.reset();

    // Update sprites
    const sprites = this.sprites();
    const world = this.world();
    this.gameTick(world);
    sprites.forEach((sprite) => sprite.tick(world));

    // Clear out key presses
    this.keysPressedThisFrame.clear();

    // Re-render
    const {canvasCtx} = this;
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, world.dimensions.width, world.dimensions.height);
      sprites.forEach((sprite) => {
        canvasCtx.restore();
        canvasCtx.globalCompositeOperation = 'normal';
        sprite.render(canvasCtx, world);
      });
    }
  }

  protected gameTick(world: WorldState) {
    // Override in subclasses
  }

  protected world(): WorldState {
    return {
      dimensions: this.props.dimensions,
      audio: this.audioAnalyser,
      keysDown: this.keysDown,
      keysPressedThisFrame: this.keysPressedThisFrame,
      deviceOrientation: this.deviceOrientation,
      frameNum: this.frameNum
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
