import {autobind} from 'core-decorators';
import React from 'react';
import {AudioAnalyser} from '../audio/AudioAnalyser';
import {DeviceOrientation, Dimensions, IPosition, WorldState} from '../types';
import {Game, GameInfo} from './Game';

export interface GameRunnerProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
  gameInfo: GameInfo;
}

export interface GameRunnerState {
  gameLoop: NodeJS.Timeout | undefined;
  menuOpen: boolean;
}

@autobind
export class GameRunner extends React.Component<GameRunnerProps, GameRunnerState> {
  // Game instance
  private readonly game: Game;

  // React state
  public state: GameRunnerState = {
    gameLoop: undefined,
    menuOpen: false
  };

  // World state
  private readonly keysDown = new Set<string>();
  private readonly keysPressedThisFrame = new Set<string>();
  private readonly audioAnalyser: AudioAnalyser;
  private deviceOrientation: DeviceOrientation | undefined;
  private mouseClickLocation: IPosition | undefined;
  private frameNum: number = 0;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private mouseDragging: boolean = false;

  constructor(props: GameRunnerProps) {
    super(props);
    this.audioAnalyser = new AudioAnalyser(props.audioSource);
    const Game = props.gameInfo.game;
    this.game = new Game(this.world());
  }

  public componentDidMount() {
    this.runGame();
    window.document.addEventListener('keydown', this.onKeyDown);
    window.document.addEventListener('keyup', this.onKeyUp);
    window.document.addEventListener('keypress', this.onKeyPress);
    window.addEventListener('deviceorientation', this.onDeviceOrientation, false);
    document.title = `KurtPreston.com | ${this.game.info.title}`;
  }

  public componentWillUnmount() {
    window.document.removeEventListener('keydown', this.onKeyDown);
    window.document.removeEventListener('keyup', this.onKeyUp);
    window.document.removeEventListener('keypress', this.onKeyPress);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);
    this.pauseGame();
  }

  public render(): React.ReactNode {
    const {game} = this;
    const {menuOpen} = this.state;
    const {dimensions} = this.props;
    const {height, width} = dimensions;

    const menu = game.menu ? (
      menuOpen ? (
        <div className='controls controls-open'>
          <button onClick={this.closeMenu}>×</button>
          {game.menu}
          {this.renderPauseBtn(true)}
        </div>
      ) : (
        <div className='controls controls-closed'>
          <button onClick={this.openMenu}>ⓘ</button>
        </div>
      )
    ) : (
      <div className='controls controls-closed'>{this.renderPauseBtn(false)}</div>
    );

    return (
      <div className='game'>
        <canvas
          height={height}
          width={width}
          ref={this.canvasRefFn}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseDown}
          onMouseUp={this.onMouseUp}
        />
        {menu}
      </div>
    );
  }

  private closeMenu() {
    this.setState({menuOpen: false});
  }

  private openMenu() {
    this.setState({menuOpen: true});
  }

  private canvasRefFn(ref: HTMLCanvasElement) {
    this.canvasCtx = ref?.getContext('2d');
    if (this.canvasCtx) {
      this.canvasCtx.globalCompositeOperation = 'source-over';
      this.canvasCtx.save();
    }
  }

  private onMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    if (event.type === 'mousemove' && !this.mouseDragging) {
      return;
    }
    if (event.type === 'mousedown') {
      this.mouseDragging = true;
    }
    const canvas: HTMLCanvasElement = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.mouseClickLocation = {x, y};
  }

  private onMouseUp(event: React.MouseEvent<HTMLCanvasElement>) {
    this.mouseDragging = false;
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

  private renderPauseBtn(text: boolean) {
    if (!this.state.gameLoop) {
      return <button onClick={this.runGame}>▶ {text ? 'Start' : ''}</button>;
    } else {
      return <button onClick={this.pauseGame}>❚❚ {text ? 'Pause' : ''}</button>;
    }
  }

  private tick() {
    // Reset frame
    this.frameNum++;
    this.audioAnalyser.reset();

    // Next game frame
    const world = this.world();
    if (this.game.gameTick) {
      this.game.gameTick(world);
    }
    const sprites = this.game.sprites();
    sprites.forEach((sprite) => sprite.tick(world));

    // Clear out user input
    this.keysPressedThisFrame.clear();
    this.mouseClickLocation = undefined;

    // Re-render
    const {canvasCtx} = this;
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, world.dimensions.width, world.dimensions.height);
      sprites.forEach((sprite) => {
        canvasCtx.save();
        sprite.render(canvasCtx, world);
        canvasCtx.restore();
      });
    }
  }

  protected world(): WorldState {
    return {
      dimensions: this.props.dimensions,
      audio: this.audioAnalyser,
      keysDown: this.keysDown,
      keysPressedThisFrame: this.keysPressedThisFrame,
      deviceOrientation: this.deviceOrientation,
      frameNum: this.frameNum,
      mouseClickLocation: this.mouseClickLocation
    };
  }

  private runGame() {
    const {gameLoop} = this.state;
    if (!gameLoop) {
      this.setState({
        gameLoop: setInterval(this.tick, 25)
      });
    }
  }

  private pauseGame() {
    const {gameLoop} = this.state;
    if (gameLoop) {
      clearInterval(gameLoop);
      this.setState({gameLoop: undefined});
    }
  }
}
