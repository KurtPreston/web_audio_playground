import {autobind} from 'core-decorators';
import React from 'react';
import {Fireball, FireballSpriteParams} from '../sprites/Fireball';
import {Ryu} from '../sprites/Ryu';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {AudioAnalyser} from '../util/AudioAnalyser';

export interface HadoukenProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface HadoukenState {
  paused: boolean;
}

@autobind
export class Hadouken extends React.Component<HadoukenProps, HadoukenState> {
  private readonly player: Ryu;
  private readonly fireballs: Set<Fireball>;
  private readonly audioAnalyser: AudioAnalyser;
  private gameLoop: NodeJS.Timeout | undefined;

  constructor(props: HadoukenProps) {
    super(props);
    this.audioAnalyser = new AudioAnalyser(props.audioSource);
    this.player = new Ryu({
      ...props,
      launchFireball: this.launchFireball
    });
    this.fireballs = new Set<Fireball>();
    this.state = {
      paused: false
    };
  }

  public componentDidMount() {
    this.runGame();
  }

  private launchFireball(params: FireballSpriteParams) {
    this.fireballs.add(
      new Fireball({
        ...params,
        destroy: this.destroyFireball
      })
    );
  }

  private destroyFireball(fireball: Fireball) {
    return this.fireballs.delete(fireball);
  }

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

  public render() {
    const {width, height} = this.props.dimensions;

    const world: WorldState = this.world();

    return (
      <>
        <svg height={height} width={width}>
          {this.sprites.map((s) => s.render(world))}
        </svg>
        <div className='controls'>{this.renderPauseBtn()}</div>
      </>
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

  private get sprites(): Sprite[] {
    const fireballs: Fireball[] = Array.from(this.fireballs.values());

    return [this.player, ...fireballs];
  }

  private world(): WorldState {
    return {
      dimensions: this.props.dimensions,
      audio: this.audioAnalyser
    };
  }

  private tick() {
    this.audioAnalyser.reset();
    const world: WorldState = this.world();
    this.sprites.forEach((s) => s.tick(world));
    this.forceUpdate();
  }
}
