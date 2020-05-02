import {autobind} from 'core-decorators';
import {each, isBoolean, isEqual, map, times, without} from 'lodash';
import React from 'react';
import {Circle} from '../sprites/Circle';
import {Flower} from '../sprites/Flower';
import {NoteGrid} from '../sprites/NoteGrid';
import {Spectrogram} from '../sprites/Sprectrogram';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {AudioAnalyser} from '../util/AudioAnalyser';

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
  flower: Sprite[];
  circles: Sprite[];
  noteGrid: Sprite[];
  spectrogram: Sprite[];
};

interface Options {
  flower: boolean;
  circles: number;
  noteGrid: boolean;
  spectrogram: boolean;
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
        flower: false,
        circles: 0,
        noteGrid: false,
        spectrogram: true
      },
      sprites: {
        flower: [],
        circles: [],
        noteGrid: [],
        spectrogram: []
      }
    };
  }

  public componentDidUpdate(prevProps: ForestVisualizerProps, prevState: ForestVisualizerState) {
    if (!isEqual(this.state.options, prevState.options)) {
      this.updateSprites();
    }
  }

  private updateSprites() {
    const {sprites, options} = this.state;
    const {dimensions} = this.props;

    const newSprites: ActiveSprites = {
      flower: [],
      circles: [],
      noteGrid: [],
      spectrogram: []
    };

    if (options.flower) {
      newSprites.flower = sprites.flower.length ? sprites.flower : [new Flower(dimensions)];
    }

    if (options.noteGrid) {
      newSprites.noteGrid = sprites.noteGrid.length ? sprites.noteGrid : [new NoteGrid()];
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
            bounceOffEdge: false,
            destroy: this.destroySprite('circles')
          })
        );
      }
    );

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
    this.runGame();
  }

  public render() {
    return (
      <>
        {this.renderSvg()}
        <div className='controls'>
          {this.renderPauseBtn()}
          {this.toggleSprite('flower')}
          {this.toggleSprite('circles')}
          {this.toggleSprite('noteGrid')}
          {this.toggleSprite('spectrogram')}
        </div>
      </>
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

  // Render
  private renderSvg() {
    if (!this.state) {
      return null;
    }

    const {sprites} = this.state;
    const {dimensions} = this.props;
    const {width, height} = dimensions;

    const world: WorldState = this.world();

    return (
      <svg height={height} width={width}>
        {map(sprites, (s: Sprite[], type: string) =>
          s.map((sprite: Sprite, idx: number) => sprite.render(world))
        )}
      </svg>
    );
  }

  private world(): WorldState {
    return {
      dimensions: this.props.dimensions,
      audio: this.audioAnalyser
    };
  }

  private renderPauseBtn() {
    const paused = this.state && this.state.paused;
    if (paused) {
      return <button onClick={this.runGame}>Start</button>;
    } else {
      return <button onClick={this.pauseGame}>Pause</button>;
    }
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
    const {sprites} = this.state;

    this.audioAnalyser.reset();

    const world: WorldState = this.world();

    each(sprites, (spriteInstances: Sprite[]) => {
      spriteInstances.forEach((sprite) => sprite.tick(world));
    });

    this.forceUpdate();
  }
}
