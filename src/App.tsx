import {map} from 'lodash';
import React from 'react';
import './App.css';
import { GameState, Sprite } from './types';
import { characterRenderer } from './spriteRenderers/characterRenderer';
import { instrumentRendererFactory } from './spriteRenderers/instrumentRenderer';

const width = 500;
const height = 500;

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
        renderer: characterRenderer
      },
      goodInstrument: {
        position: {
          x: 0,
          y: height / 2,
          angle: 90
        },
        renderer: instrumentRendererFactory({color: 'aquamarine'})
      },
      badInstrument: {
        position: {
          x: width,
          y: height / 2,
          angle: 90
        },
        renderer: instrumentRendererFactory({color: 'red'})
      }
    }
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

  private renderSprite(sprite: Sprite): React.ReactElement<SVGElement> {
    const {position, renderer} = sprite;
    return renderer(position);
  }
}

export default App;
