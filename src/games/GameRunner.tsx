import {autobind} from 'core-decorators';
import React from 'react';
import {AudioAnalyser} from '../audio/AudioAnalyser';
import {DeviceOrientation, Dimensions, emptyAudioData, IPosition, WorldState} from '../types';
import {Game, GameInfo} from './Game';

export interface GameRunnerProps {
  dimensions: Dimensions;
  gameInfo: GameInfo;
}

export interface GameRunnerState {
  gameLoop: NodeJS.Timeout | undefined;
  menuOpen: boolean;
  requireClickToStart: boolean;
}

interface AudioNodes {
  audioContext: AudioContext;
  analyserNode: AnalyserNode;
  audioAnalyser: AudioAnalyser;
}

@autobind
export class GameRunner extends React.Component<GameRunnerProps, GameRunnerState> {
  // Game instance
  private game: Game | undefined;

  // React state
  public state: GameRunnerState = {
    gameLoop: undefined,
    menuOpen: false,
    requireClickToStart: true
  };

  // World state
  private readonly keysDown = new Set<string>();
  private readonly keysPressedThisFrame = new Set<string>();
  private deviceOrientation: DeviceOrientation | undefined;
  private mouseClickLocation: IPosition | undefined;
  private frameNum: number = 0;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private mouseDragging: boolean = false;

  // Audio
  private audio: AudioNodes | undefined;

  public componentDidMount() {
    window.document.addEventListener('keydown', this.onKeyDown);
    window.document.addEventListener('keyup', this.onKeyUp);
    window.document.addEventListener('keypress', this.onKeyPress);
    window.addEventListener('deviceorientation', this.onDeviceOrientation, false);
    document.title = `KurtPreston.com | ${this.props.gameInfo.title}`;

    this.initializeGame();
  }

  private initializeGame() {
    // Create audio first
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const analyserNode = audioContext.createAnalyser();
    const audioAnalyser = new AudioAnalyser(analyserNode);

    if (audioContext.state !== 'running') {
      console.warn('AudioContext could not be initialized. Click first');
      this.setState({
        requireClickToStart: true
      });
      return;
    }

    this.audio = {
      audioContext,
      analyserNode,
      audioAnalyser
    };
    const Game = this.props.gameInfo.game;
    this.game = new Game(this.world(), {
      mic: this.requestMic,
      analyserNode,
      audioContext
    });
    this.runGame();

    this.setState({
      requireClickToStart: false
    });
  }

  public componentWillUnmount() {
    window.document.removeEventListener('keydown', this.onKeyDown);
    window.document.removeEventListener('keyup', this.onKeyUp);
    window.document.removeEventListener('keypress', this.onKeyPress);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);
    this.pauseGame();
  }

  public render(): React.ReactNode {
    const {dimensions} = this.props;
    const {height, width} = dimensions;

    return (
      <div className='game'>
        <canvas
          height={height}
          width={width}
          ref={this.canvasRefFn}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseDown}
          onTouchMove={this.onTouchMove}
          onMouseUp={this.onMouseUp}
          onMouseOut={this.onMouseUp}
        />
        {this.renderMenu()}
      </div>
    );
  }

  private renderTitle() {
    const {gameInfo} = this.props;
    return (
      <div className='title-container' onClick={this.initializeGame}>
        <div className='title'>
          <h1>{gameInfo.title}</h1>
          <p>{gameInfo.description}</p>
        </div>
      </div>
    );
  }

  private renderMenu() {
    const {game} = this;
    const {menuOpen, requireClickToStart} = this.state;
    if (!game) {
      return null;
    }

    if (requireClickToStart) {
      return this.renderTitle();
    } else if (game.menu) {
      if (menuOpen) {
        return (
          <div className='controls controls-open'>
            <button onClick={this.closeMenu}>×</button>
            {game.menu}
            {this.renderPauseBtn(true)}
          </div>
        );
      } else {
        return (
          <div className='controls controls-closed'>
            <button onClick={this.openMenu}>ⓘ</button>
          </div>
        );
      }
    }
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

  private onTouchMove(event: React.TouchEvent<HTMLCanvasElement>) {
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;
    this.mouseClickLocation = {x, y};
  }

  private onMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    if (event.type === 'mousemove' && !this.mouseDragging) {
      return;
    }
    if (event.type === 'mousedown') {
      this.mouseDragging = true;
    }
    const x = event.clientX;
    const y = event.clientY;
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
    if (!this.game) {
      return;
    }

    if (this.audio?.audioContext.state !== 'running') {
      this.setState({
        requireClickToStart: true
      });
      return;
    }

    // Reset frame
    this.frameNum++;
    this.audio?.audioAnalyser.reset();

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
      audio: this.audio?.audioAnalyser || emptyAudioData,
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

  private async requestMic() {
    if (!navigator.mediaDevices) {
      console.warn('No media devices available');
      this.setState({
        requireClickToStart: true
      });
      return;
    }

    if (!this.audio) {
      console.warn('No audio context initialized');
      this.setState({
        requireClickToStart: true
      });
      return;
    }

    const {audioContext, analyserNode} = this.audio;

    // Get from mic
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    const audioSource: AudioNode = audioContext.createMediaStreamSource(stream);
    audioSource.connect(analyserNode);
    const audioState: AudioContextState = audioSource.context.state;

    this.setState({
      requireClickToStart: audioState === 'suspended'
    });
  }
}
