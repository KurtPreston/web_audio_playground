import {autobind} from 'core-decorators';
import {map, mapValues} from 'lodash';
import React from 'react';
import './App.css';
import { GameState, Sprite } from './types';
import { characterRenderer } from './spriteRenderers/characterRenderer';
import { instrumentRendererFactory } from './spriteRenderers/instrumentRenderer';
import { randomWalkFactory } from './frameTickers/randomWalk';

const width = 500;
const height = 500;

@autobind
export class App extends React.Component<{}, GameState> {
  public state: GameState = {
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
  }

  public componentDidMount() {
    this.runGame();
  }

  private gameLoop: NodeJS.Timeout | undefined;

  private tick() {
    const {sprites, world} = this.state;
    this.setState({
      sprites: mapValues(sprites, (sprite: Sprite): Sprite => ({
        ...sprite,
        position: sprite.tick(sprite.position, world)
      }))
    })
  }

  public render() {
    const {sprites, world} = this.state;
    const {width, height} = world;

    return (
      <div className="App">
        <header className="App-header">
          Wamdag Quest
        </header>
        <main>
          {this.renderPauseBtn()}
          <svg height={height} width={width}>
            {map(sprites, this.renderSprite)}
          </svg>
        </main>
      </div>
    );
  }

  private renderPauseBtn() {
    const {paused} = this.state;
    if(paused) {
      return <button onClick={this.runGame}>Start</button>;
    } else {
      return <button onClick={this.pauseGame}>Pause</button>;
    }
  }

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

  private renderSprite(sprite: Sprite, idx: number): React.ReactElement<SVGElement> {
    const {position, renderer} = sprite;
    return (
      <React.Fragment key={idx}>
        {renderer(position)}
      </React.Fragment>
    );
  }
}

export default App;
