import React from 'react';
import { Dimensions, Sprite } from '../types';
import { times, random, sample, map } from 'lodash';
import { circleRendererFactory } from '../spriteRenderers/circle';
import { randomColor } from '../util/color';
import { randomWalkFactory, JitterType } from '../frameTickers/randomWalk';
import { flowerRenderer } from '../spriteRenderers/flower';
import { AudioAnalyser } from '../util/audioAnalysis';
import { autobind } from 'core-decorators';

export interface ForestVisualizerProps {
  dimensions: Dimensions;
  audioAnalyser: AnalyserNode;
}

export interface ForestVisualizerState {
  paused: boolean;
  sprites: Sprite[];
}

@autobind
export class ForestVisualizer extends React.Component<ForestVisualizerProps, ForestVisualizerState> {
  private gameLoop: NodeJS.Timeout | undefined;
  private audioAnalyser: AudioAnalyser;

  constructor(props: ForestVisualizerProps) {
    super(props);
    const {height, width} = props.dimensions;
    const circles: Sprite[] = times(20, (): Sprite => {
      return {
        position: {
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
    });

    const flower: Sprite = {
      position: {
        // In center, facing up
        x: width /2,
        y: height / 2,
        angle: Math.PI / 2
      },
      renderer: flowerRenderer,
      tick: randomWalkFactory({velocity: 5, jitter: 0.03, jitterType: 'random'}),
    };

    this.state = {
      paused: false,
      sprites: [
        flower,
        ...circles
      ]
    };

    this.audioAnalyser = new AudioAnalyser(props.audioAnalyser);
  }

  public componentDidMount() {
    this.runGame();
  }

  public render() {
    return (
      <>
        {this.renderSvg()}
        <div className='controls'>
          {this.renderPauseBtn()}
        </div>
      </>
    );
  }

  // Render
  private renderSvg() {
    if(!this.state) {
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
    if(paused) {
      return <button onClick={this.runGame}>Start</button>;
    } else {
      return <button onClick={this.pauseGame}>Pause</button>;
    }
  }

  private renderSprite(sprite: Sprite, idx: number): React.ReactElement<SVGElement> {
    const {position, renderer} = sprite;
    return (
      <React.Fragment key={idx}>
        {renderer(position, this.audioAnalyser)}
      </React.Fragment>
    );
  }

  // State + control
  private runGame() {
    this.setState({
      paused: false
    }, () => {
      this.gameLoop = setInterval(this.tick, 25);
    });
  }

  private pauseGame() {
    if(this.gameLoop) {
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
      sprites: sprites.map((sprite: Sprite): Sprite => ({
        ...sprite,
        position: sprite.tick(sprite.position, dimensions)
      }))
    })
  }
}