import {autobind} from 'core-decorators';
import {flatten, isBoolean, times, values, without} from 'lodash';
import React from 'react';
import {Background} from '../sprites/Background';
import {Flower} from '../sprites/Flower';
import {NoteGrid} from '../sprites/NoteGrid';
import {Spectrogram} from '../sprites/Sprectrogram';
import {Sprite} from '../sprites/Sprite';
import {Wisp} from '../sprites/Wisp';
import {Dimensions, WorldState} from '../types/State';
import {Game, GameInfo, ResourceInitializers} from './Game';

export interface DemoState {
  sprites: ActiveSprites;
}

type ActiveSprites = {
  flower: Sprite[];
  wisps: Sprite[];
  noteGrid: Sprite[];
  spectrogram: Sprite[];
  background: Sprite[];
};

interface Options {
  flower: boolean;
  wisps: number;
  noteGrid: boolean;
  spectrogram: boolean;
}

const defaultOptions: Options = {
  flower: false,
  wisps: 0,
  noteGrid: true,
  spectrogram: false
};

@autobind
export class DemoGame implements Game {
  private options: Options = defaultOptions;
  private nextOptions: Options | undefined;
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
    wisps: [],
    noteGrid: [],
    spectrogram: []
  };

  constructor(world: WorldState, initializers: ResourceInitializers) {
    initializers.mic();
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
      wisps: [],
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

    newSprites.wisps = times(
      options.wisps,
      (circleNum: number): Sprite => {
        return (
          (activeSprites.wisps || [])[circleNum] ||
          new Wisp({
            dimensions,
            bounceOffEdge: true,
            destroy: this.destroySprite('wisps'),
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

  public gameTick(world: WorldState) {
    // If options have changed, regenerate sprites
    if (this.nextOptions) {
      this.options = this.nextOptions;
      this.nextOptions = undefined;
      this.updateSprites(world.dimensions);
    }
  }

  public menu() {
    return <DemoMenu options={this.options} updateOptions={this.updateOptions} />;
  }

  private updateOptions(options: Options) {
    this.nextOptions = options;
  }
}

interface DemoMenuProps {
  options: Options;
  updateOptions: (options: Options) => void;
}

interface DemoMenuState {
  options: Options;
}

class DemoMenu extends React.PureComponent<DemoMenuProps, DemoMenuState> {
  constructor(props: DemoMenuProps) {
    super(props);
    this.state = {
      options: props.options
    };
  }

  public render() {
    return (
      <div>
        {this.toggleSprite('flower')}
        {this.toggleSprite('wisps')}
        {this.toggleSprite('noteGrid')}
        {this.toggleSprite('spectrogram')}
      </div>
    );
  }

  private toggleSprite(spriteType: keyof Options) {
    const {options} = this.state;
    const {updateOptions} = this.props;
    const value = options[spriteType];
    const setValue = (newValue: typeof value) => {
      const newOptions: Options = {
        ...options,
        [spriteType]: newValue
      };
      updateOptions(newOptions);
      this.setState({
        options: newOptions
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

class DemoPreview implements Game {
  private noteGrid = new NoteGrid({
    showFrequency: false,
    showNoteName: false
  });

  public sprites(): Sprite[] {
    return [this.noteGrid];
  }
}

export const Demo: GameInfo = {
  title: 'Light Factory',
  url: '/factory',
  description: 'The scraps from the cutting room',
  game: DemoGame,
  preview: DemoPreview
};
