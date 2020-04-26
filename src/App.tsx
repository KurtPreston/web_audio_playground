import {autobind} from 'core-decorators';
import {map, mapValues} from 'lodash';
import React from 'react';
import './App.css';
import { GameState, Sprite } from './types';
import { characterRenderer } from './spriteRenderers/characterRenderer';
import { instrumentRendererFactory } from './spriteRenderers/instrumentRenderer';
import { randomWalk } from './frameTickers/randomWalk';

const width = 500;
const height = 500;

@autobind
export class App extends React.Component<{}, GameState> {
  public state: GameState = {
    world: {
      height,
      width
    },
    sprites: {
      character: {
        position: {
          x: width /2,
          y: height / 2,
          angle: 0
        },
        renderer: characterRenderer,
        tick: randomWalk
      },
      goodInstrument: {
        position: {
          x: 0,
          y: height / 2,
          angle: 90
        },
        renderer: instrumentRendererFactory({color: 'aquamarine'}),
        tick: randomWalk
      },
      badInstrument: {
        position: {
          x: width,
          y: height / 2,
          angle: 90
        },
        renderer: instrumentRendererFactory({color: 'red'}),
        tick: randomWalk
      }
    }
  }

  public componentDidMount() {
    // Setup game loop
    setInterval(this.tick, 25);
  }

  private tick() {
    const {sprites} = this.state;
    this.setState({
      sprites: mapValues(sprites, (sprite: Sprite): Sprite => ({
        ...sprite,
        position: sprite.tick(sprite.position)
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
          <svg height={height} width={width}>
            {map(sprites, this.renderSprite)}
          </svg>
        </main>
      </div>
    );
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
