import React from 'react';
import {Dimensions, Sprite, IWanderer, INoteGrid} from '../types';
import {times, random, sample, map, identity} from 'lodash';
import {circleRendererFactory} from '../spriteRenderers/circle';
import {randomColor} from '../util/color';
import {randomWalkFactory, JitterType} from '../frameTickers/randomWalk';
import {flowerRenderer} from '../spriteRenderers/flower';
import {AudioAnalyser} from '../util/audioAnalysis';
import {autobind} from 'core-decorators';
import {noteGridRenderer} from '../spriteRenderers/noteGrid';

export interface ForestVisualizerProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface ForestVisualizerState {
  paused: boolean;
  sprites: Sprite<any>[];
}

@autobind
export class ForestVisualizer extends React.Component<
  ForestVisualizerProps,
  ForestVisualizerState
> {
  private gameLoop: NodeJS.Timeout | undefined;
  private audioAnalyser: AudioAnalyser;

  constructor(props: ForestVisualizerProps) {
    super(props);
    const {height, width} = props.dimensions;

    const flower: Sprite<IWanderer> = {
      state: {
        // In center, facing up
        x: width / 2,
        y: height / 2,
        angle: Math.PI / 2
      },
      renderer: flowerRenderer,
      tick: randomWalkFactory({velocity: 5, jitter: 0.03, jitterType: 'random'})
    };

    const noteGrid: Sprite<INoteGrid> = {
      state: {},
      renderer: noteGridRenderer,
      tick: identity
    };

    const circles: Sprite<IWanderer>[] = times(
      20,
      (): Sprite<IWanderer> => {
        return {
          state: {
            // On left, facing right
            x: 0,
            y: height / 2,
            angle: 0
          },
          renderer: circleRendererFactory({
            fill: randomColor(),
            mixBlendMode: 'color-dodge'
          }),
          tick: randomWalkFactory({
            velocity: random(3, 7),
            jitter: random(0.01, 0.08),
            jitterType: sample(['leanLeft', 'leanRight', 'random']) as JitterType
          })
        };
      }
    );

    this.state = {
      paused: false,
      sprites: [flower, noteGrid, ...circles]
    };

    this.audioAnalyser = new AudioAnalyser(props.audioSource);
  }

  public componentDidMount() {
    this.runGame();
  }

  public render() {
    return (
      <>
        {this.renderSvg()}
        <div className='controls'>{this.renderPauseBtn()}</div>
      </>
    );
  }

  // Render
  private renderSvg() {
    if (!this.state) {
      return null;
    }

    const {sprites} = this.state;
    const {width, height} = this.props.dimensions;

    return (
      <svg height={height} width={width}>
        {map(sprites, this.renderSprite)}
      </svg>
    );
  }

  private renderPauseBtn() {
    const paused = this.state && this.state.paused;
    if (paused) {
      return <button onClick={this.runGame}>Start</button>;
    } else {
      return <button onClick={this.pauseGame}>Pause</button>;
    }
  }

  private renderSprite(sprite: Sprite<any>, idx: number): React.ReactElement<SVGElement> {
    const {state, renderer} = sprite;
    return <React.Fragment key={idx}>{renderer(state, this.audioAnalyser, this.props.dimensions)}</React.Fragment>;
  }

  // State + control
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

  private tick() {
    const {dimensions} = this.props;
    const {sprites} = this.state;

    this.audioAnalyser.reset();

    this.setState({
      sprites: sprites.map(
        (sprite: Sprite<any>): Sprite<any> => ({
          ...sprite,
          state: sprite.tick(sprite.state, dimensions)
        })
      )
    });
  }
}
