import {autobind} from 'core-decorators';
import NoSleep from 'nosleep.js';
import React from 'react';
import {Context as AudioContext, setContext} from 'tone';
import {clearInterval, setInterval} from 'worker-timers';
import {AudioAnalyser, fakeAudioAnalyserSingleton, IAudioAnalyser} from '../audio/AudioAnalyser';
import {emptyAudioData} from '../types/AudioData';
import {DeviceOrientation, Dimensions, FRAME_RATE, IPosition, WorldState} from '../types/State';
import {Game, GameInfo} from './Game';

export interface GameRunnerProps {
  gameInfo: GameInfo;
  fakeAudioContext?: boolean;
  preview?: boolean;
}

export interface GameRunnerState {
  gameLoop: number | undefined;
  menuOpen: boolean;
  requireClickToStart: boolean;
  dimensions: Dimensions | undefined;
}

interface AudioNodes {
  audioContext: AudioContext;
  analyserNode: AnalyserNode;
  audioAnalyser: IAudioAnalyser;
}

@autobind
export class GameRunner extends React.Component<GameRunnerProps, GameRunnerState> {
  // Game instance
  private game: Game | undefined;

  // React state
  public state: GameRunnerState = {
    gameLoop: undefined,
    menuOpen: false,
    requireClickToStart: true,
    dimensions: undefined
  };
  private container: HTMLElement | null = null;

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

  // Listeners
  private noSleep: NoSleep = new NoSleep();

  public componentDidMount() {
    window.document.addEventListener('keydown', this.onKeyDown);
    window.document.addEventListener('keyup', this.onKeyUp);
    window.document.addEventListener('keypress', this.onKeyPress);
    if (!this.props.preview) {
      document.title = `KurtPreston.com | ${this.props.gameInfo.title}`;
    }

    window.addEventListener('resize', this.setDimensions);
  }

  private setDimensions() {
    if (this.container) {
      const {clientWidth, clientHeight} = this.container;
      this.setState({
        dimensions: {
          width: clientWidth,
          height: clientHeight
        }
      });
    }
  }

  private async initializeGame() {
    if (this.game) {
      console.info(`Game ${this.props.gameInfo.title} already running`);
      return;
    }

    if (!this.state.dimensions) {
      return;
    }

    // Create audio first
    const audioContext: AudioContext = new AudioContext();
    const analyserNode = audioContext.createAnalyser();
    const audioAnalyser: IAudioAnalyser = this.props.fakeAudioContext
      ? new AudioAnalyser(analyserNode)
      : fakeAudioAnalyserSingleton;

    if (!this.props.fakeAudioContext) {
      if (audioContext.state !== 'running') {
        await audioContext.resume();
      }
      if (audioContext.state !== 'running') {
        console.warn(`AudioContext is ${audioContext.state}. Cannot create game.`);
        this.setState({
          requireClickToStart: true
        });
        return;
      }
      setContext(audioContext);
    } else {
      // const tone = new Oscillator({
      //   type: 'triangle',
      //   frequency: 20
      // });
      // tone.start();
      // tone.frequency.exponentialRampTo(220, 10);
      // const tremolo = new Tremolo(0.2, 1);
      // tone.connect(tremolo);
      // tremolo.connect(analyserNode);
      // tremolo.toMaster();
    }

    this.noSleep.enable();

    this.audio = {
      audioContext,
      analyserNode,
      audioAnalyser
    };
    const Game = this.props.preview ? this.props.gameInfo.preview : this.props.gameInfo.game;
    this.game = new Game(
      this.world(),
      {
        mic: this.requestMic,
        deviceOrientation: this.requestDeviceOrientation,
        analyserNode,
        audioContext
      },
      () => this.forceUpdate()
    );
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
    this.audio?.audioContext.close();
    this.noSleep.disable();
    if (this.game?.destroy) {
      this.game.destroy();
    }
  }

  public render(): React.ReactNode {
    const {dimensions} = this.state;

    return (
      <div className='game' ref={this.containerRefFn}>
        {dimensions ? (
          <canvas
            ref={this.canvasRefFn}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={this.onMouseDown}
            onMouseMove={this.onMouseDown}
            onTouchMove={this.onTouchMove}
            onTouchEnd={this.onTouchEnd}
            onMouseUp={this.onMouseUp}
            onMouseOut={this.onMouseUp}
          />
        ) : null}
        {this.renderMenu()}
      </div>
    );
  }

  private containerRefFn(ref: HTMLElement | null) {
    this.container = ref;
    setTimeout(() => {
      this.setDimensions();
      this.initializeGame();
    }, 5);
  }

  private renderTitle() {
    const {gameInfo} = this.props;
    return (
      <div className='title-container' onClick={this.initializeGame}>
        <div className='title'>
          <h1>{gameInfo.title}</h1>
          <div>{gameInfo.description}</div>
        </div>
      </div>
    );
  }

  private renderMenu() {
    const {game} = this;
    const {menuOpen, requireClickToStart} = this.state;

    if (!game || requireClickToStart) {
      return this.renderTitle();
    } else if (game.menu) {
      if (menuOpen) {
        return (
          <div className='menu menu-open'>
            <div className='controls'>
              {this.renderPauseBtn(true)}
              <button onClick={this.closeMenu}>×</button>
            </div>
            {game.menu()}
          </div>
        );
      } else {
        return (
          <div className='menu menu-closed'>
            <button onClick={this.openMenu}>☰</button>
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
    this.mouseDragging = true;
    this.mouseClickLocation = {x, y};
  }

  private onTouchEnd(event: React.TouchEvent<HTMLCanvasElement>) {
    this.mouseDragging = false;
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
    if (!this.game || this.audio?.audioContext.state !== 'running') {
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
    if (!this.mouseDragging) {
      this.mouseClickLocation = undefined;
    }

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
    if (!this.state.dimensions) {
      throw new Error('No dimensions');
    }

    return {
      dimensions: this.state.dimensions,
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
        gameLoop: setInterval(this.tick, FRAME_RATE)
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

  private requestDeviceOrientation() {
    window.addEventListener('deviceorientation', this.onDeviceOrientation, false);
  }
}
