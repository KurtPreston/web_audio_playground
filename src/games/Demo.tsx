import {autobind} from 'core-decorators';
import {flatten, isBoolean, times, values, without} from 'lodash';
import React from 'react';
import {Background} from '../sprites/Background';
import {Circle} from '../sprites/Circle';
import {Flower} from '../sprites/Flower';
import {NoteGrid} from '../sprites/NoteGrid';
import {Spectrogram} from '../sprites/Sprectrogram';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {Game, GameInfo} from './Game';

export interface DemoState {
  sprites: ActiveSprites;
}

type ActiveSprites = {
  flower: Sprite[];
  circles: Sprite[];
  noteGrid: Sprite[];
  spectrogram: Sprite[];
  background: Sprite[];
};

interface Options {
  flower: boolean;
  circles: number;
  noteGrid: boolean;
  spectrogram: boolean;
}

@autobind
export class DemoGame implements Game {
  private options: Options = {
    flower: false,
    circles: 0,
    noteGrid: true,
    spectrogram: false
  };
  private activeSprites: ActiveSprites = {
    background: [
      new Background({}, 0),
      new Background(
        {
          mixBlendMode: 'soft-light'
        },
        0.4
      ),
      new Background(
        {
          mixBlendMode: 'exclusion'
        },
        -0.8
      )
    ],
    flower: [],
    circles: [],
    noteGrid: [],
    spectrogram: []
  };

  constructor(world: WorldState) {
    this.updateSprites(world.dimensions);
  }

  public sprites(): Sprite[] {
    return flatten(values(this.activeSprites));
  }

  private updateSprites(dimensions: Dimensions) {
    const {activeSprites, options} = this;
    const newSprites: ActiveSprites = {
      background: [],
      flower: [],
      circles: [],
      noteGrid: [],
      spectrogram: []
    };

    if (options.flower) {
      newSprites.flower = activeSprites.flower.length
        ? activeSprites.flower
        : [new Flower(dimensions)];
    }

    if (options.noteGrid) {
      newSprites.noteGrid = activeSprites.noteGrid.length
        ? activeSprites.noteGrid
        : [
            new NoteGrid({
              lowOctave: 2,
              highOctave: 6,
              showPitchIndicator: true
            })
          ];
    }

    if (options.spectrogram) {
      newSprites.spectrogram = activeSprites.spectrogram.length
        ? activeSprites.spectrogram
        : [new Spectrogram()];
    }

    newSprites.circles = times(
      options.circles,
      (circleNum: number): Sprite => {
        return (
          (activeSprites.circles || [])[circleNum] ||
          new Circle({
            dimensions,
            bounceOffEdge: true,
            destroy: this.destroySprite('circles'),
            mixBlendMode: 'color-dodge'
          })
        );
      }
    );

    newSprites.background = activeSprites.background;

    this.activeSprites = newSprites;
  }

  private destroySprite(category: keyof ActiveSprites) {
    return (sprite: Sprite): boolean => {
      const {activeSprites} = this;
      const spritesInCategory: Sprite[] = activeSprites[category];
      if (spritesInCategory.includes(sprite)) {
        this.activeSprites = {
          ...activeSprites,
          [category]: without(spritesInCategory, sprite)
        };
        return true;
      } else {
        return false;
      }
    };
  }

  public gameTick() {
    // If options have changed, regenerate sprites
  }

  public menu() {
    return (
      <div>
        {this.toggleSprite('flower')}
        {this.toggleSprite('circles')}
        {this.toggleSprite('noteGrid')}
        {this.toggleSprite('spectrogram')}
      </div>
    );
  }

  private toggleSprite(spriteType: keyof Options) {
    const value = this.options[spriteType];
    const setValue = (newValue: typeof value) => {
      this.options = {
        ...this.options,
        [spriteType]: newValue
      };
    };

    if (isBoolean(value)) {
      return (
        <label>
          {spriteType}
          <input type='checkbox' checked={value} onChange={() => setValue(!value)} />
        </label>
      );
    } else if (isFinite(value)) {
      return (
        <label>
          {spriteType}
          <input
            type='number'
            value={value}
            min={0}
            max={99}
            size={2}
            onChange={(e) => setValue(parseInt(e.target.value))}
          />
        </label>
      );
    }
  }

  public info = Demo;
}

export const Demo: GameInfo = {
  title: 'Demo',
  url: '/demo',
  description: 'Space for testing new sprites and visualizations',
  dataSources: ['mic'],
  game: DemoGame
};
