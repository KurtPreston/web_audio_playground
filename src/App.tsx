import {autobind} from 'core-decorators';
import {map, mapValues} from 'lodash';
import React from 'react';
import './App.scss';
import { GameState, Sprite } from './types';
import { characterRenderer } from './spriteRenderers/characterRenderer';
import { instrumentRendererFactory } from './spriteRenderers/instrumentRenderer';
import { randomWalkFactory } from './frameTickers/randomWalk';

@autobind
export class App extends React.Component<{}, GameState> {
  private gameLoop: NodeJS.Timeout | undefined;
  private svgRef: SVGSVGElement | undefined;

  public componentDidMount() {
    this.runGame();
  }

  // Renderers
  public render() {
    return (
      <div className="App">
        <main>
          {this.renderSvg()}
          <div className='controls'>
            {this.renderPauseBtn()}
          </div>
        </main>
      </div>
    );
  }

  private renderSvg() {
    if(!this.state) {
      return <svg ref={this.svgRefFn}/>
    }
  
    const {sprites, world} = this.state;
    const {width, height} = world;

    return (
      <svg ref={this.svgRefFn} height={height} width={width}>
        {map(sprites, this.renderSprite)}
      </svg>
    );
  }

  private svgRefFn(ref: SVGSVGElement) {
    this.svgRef = ref;
    const {clientWidth, clientHeight} = ref;
    this.initializeState(clientWidth, clientHeight);
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
        {renderer(position)}
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

  private initializeState(width: number, height: number) {
    const state: GameState = {
      paused: false,
      world: {
        height,
        width
      },
      sprites: {
        character: {
          position: {
            // In center, facing up
            x: width /2,
            y: height / 2,
            angle: Math.PI / 2
          },
          renderer: characterRenderer,
          tick: randomWalkFactory({velocity: 5, jitter: 0.03, jitterType: 'random'}),
        },
        goodInstrument: {
          position: {
            // On left, facing right
            x: 0,
            y: height / 2,
            angle: 0
          },
          renderer: instrumentRendererFactory({color: 'aquamarine'}),
          tick: randomWalkFactory({velocity: 4, jitter: 0.03, jitterType: 'leanLeft'})
        },
        badInstrument: {
          position: {
            // On right, facing left
            x: width,
            y: height / 2,
            angle: Math.PI
          },
          renderer: instrumentRendererFactory({color: 'red'}),
          tick: randomWalkFactory({velocity: 6, jitter: 0.05, jitterType: 'leanRight'})
        }
      }
    };

    this.setState({...state});
  };


  private tick() {
    const {sprites, world} = this.state;
    this.setState({
      sprites: mapValues(sprites, (sprite: Sprite): Sprite => ({
        ...sprite,
        position: sprite.tick(sprite.position, world)
      }))
    })
  }
}

export default App;
