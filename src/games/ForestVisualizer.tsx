import React from 'react';
import {Dimensions, Sprite, IWanderer, INoteGrid} from '../types';
import {times, random, sample, map, identity, mapValues} from 'lodash';
import {circleRendererFactory} from '../spriteRenderers/circle';
import {randomColor} from '../util/color';
import {randomWalkFactory, JitterType} from '../frameTickers/randomWalk';
import {flowerRenderer} from '../spriteRenderers/flower';
import {AudioAnalyser} from '../util/AudioAnalyser';
import {autobind} from 'core-decorators';
import {noteGridRenderer} from '../spriteRenderers/noteGrid';

export interface ForestVisualizerProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface ForestVisualizerState {
  paused: boolean;
  options: Options;
  sprites: ActiveSprites;
}

type ActiveSprites = {
  flower: Sprite<IWanderer>[];
  circles: Sprite<IWanderer>[];
  noteGrid: Sprite<INoteGrid>[];
}

interface Options {
  flower: boolean;
  circles: number;
  noteGrid: boolean;
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
    this.audioAnalyser = new AudioAnalyser(props.audioSource);
    this.state = {
      paused: false,
      options: {
        flower: true,
        circles: 20,
        noteGrid: true
      },
      sprites: {
        flower: [],
        circles: [],
        noteGrid: []
      }
    }
  }

  private updateSprites() {
    const {sprites, options} = this.state;
    const {height, width} = this.props.dimensions;

    const newSprites: ActiveSprites = {
      flower: [],
      circles: [],
      noteGrid: []
    };

    if(options.flower) {
      newSprites.flower = sprites.flower.length
        ? sprites.flower
        : [{
          state: {
            // In center, facing up
            x: width / 2,
            y: height / 2,
            angle: Math.PI / 2
          },
          renderer: flowerRenderer,
          tick: randomWalkFactory({velocity: 5, jitter: 0.03, jitterType: 'random'})
        }]
    }

    if(options.noteGrid) {
      newSprites.noteGrid = sprites.noteGrid.length
        ? sprites.noteGrid
        : [{
          state: {},
          renderer: noteGridRenderer,
          tick: identity
        }]
    }

    newSprites.circles = times(options.circles, (circleNum: number): Sprite<IWanderer> => {
      return (sprites.circles || [])[circleNum] || {
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
      }
    });

    this.setState({
      sprites: newSprites
    });
  }

  public componentDidMount() {
    this.updateSprites();
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
        {map(sprites, (s: Sprite<any>[], type: string) => (
          s.map((sprite: Sprite<any>, idx: number) => this.renderSprite(sprite, type, idx))
        ))}
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

  private renderSprite(sprite: Sprite<any>, type: string, idx: number): React.ReactElement<SVGElement> {
    const {state, renderer} = sprite;
    const key = `${type}${idx}`;

    if(!renderer) {
      debugger;
    }
    return (
      <React.Fragment key={key}>
        {renderer(state, this.audioAnalyser, this.props.dimensions)}
      </React.Fragment>
    );
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
      sprites: mapValues(sprites, (sprites: Sprite<any>[]) => (
        sprites.map((sprite: Sprite<any>): Sprite<any> => ({
          ...sprite,
          state: sprite.tick(sprite.state, dimensions)
        })
      ))) as any
    });
  }
}
