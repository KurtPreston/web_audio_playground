import {autobind} from 'core-decorators';
import {flatten, isBoolean, isEqual, times, values, without} from 'lodash';
import React from 'react';
import {Background} from '../sprites/Background';
import {Circle} from '../sprites/Circle';
import {Flower} from '../sprites/Flower';
import {NoteGrid} from '../sprites/NoteGrid';
import {Spectrogram} from '../sprites/Sprectrogram';
import {Sprite} from '../sprites/Sprite';
import {Game, GameProps} from './Game';

export interface ForestVisualizerState {
  options: Options;
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
export class ForestVisualizer extends Game<ForestVisualizerState> {
  public state: ForestVisualizerState = {
    options: {
      flower: false,
      circles: 0,
      noteGrid: true,
      spectrogram: false
    },
    sprites: {
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
    }
  };

  public componentDidUpdate(prevProps: GameProps, prevState: ForestVisualizerState) {
    if (!isEqual(this.state.options, prevState.options)) {
      this.updateSprites();
    }
  }

  protected sprites(): Sprite[] {
    return flatten(values(this.state.sprites));
  }

  private updateSprites() {
    const {sprites, options} = this.state;
    const {dimensions} = this.props;

    const newSprites: ActiveSprites = {
      background: [],
      flower: [],
      circles: [],
      noteGrid: [],
      spectrogram: []
    };

    if (options.flower) {
      newSprites.flower = sprites.flower.length ? sprites.flower : [new Flower(dimensions)];
    }

    if (options.noteGrid) {
      newSprites.noteGrid = sprites.noteGrid.length
        ? sprites.noteGrid
        : [
            new NoteGrid({
              lowOctave: 2,
              highOctave: 6,
              showPitchIndicator: true
            })
          ];
    }

    if (options.spectrogram) {
      newSprites.spectrogram = sprites.spectrogram.length
        ? sprites.spectrogram
        : [new Spectrogram()];
    }

    newSprites.circles = times(
      options.circles,
      (circleNum: number): Sprite => {
        return (
          (sprites.circles || [])[circleNum] ||
          new Circle({
            dimensions,
            bounceOffEdge: true,
            destroy: this.destroySprite('circles'),
            mixBlendMode: 'xor'
          })
        );
      }
    );

    newSprites.background = sprites.background;

    this.setState({
      sprites: newSprites
    });
  }

  private destroySprite(category: keyof ActiveSprites) {
    return (sprite: Sprite): boolean => {
      const {sprites} = this.state;
      const spritesInCategory: Sprite[] = sprites[category];
      if (spritesInCategory.includes(sprite)) {
        this.setState({
          sprites: {
            ...sprites,
            [category]: without(spritesInCategory, sprite)
          }
        });
        return true;
      } else {
        return false;
      }
    };
  }

  public componentDidMount() {
    this.updateSprites();
    super.componentDidMount();
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
    const value = this.state.options[spriteType];
    const setValue = (newValue: typeof value) => {
      this.setState({
        options: {
          ...this.state.options,
          [spriteType]: newValue
        }
      });
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
}
