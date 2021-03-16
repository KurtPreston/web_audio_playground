import {autobind} from 'core-decorators';
import React from 'react';
import {Compressor, ToneAudioNode, Transport} from 'tone';
import {NoteValue} from '../../audio/Note';
import {Sequencer} from '../../audio/Sequencer/Sequencer';
import {SequencerOptions} from '../../audio/Sequencer/SequencerOptions.generated';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {OuterSpace} from '../../sprites/OuterSpace';
import {Sprite} from '../../sprites/Sprite';
import {SequencerOptionsSchema} from '../../types/schemas.generated';
import {WorldState} from '../../types/State';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import './Solo.scss';

@autobind
export class SoloGame implements Game {
  // Sprites
  private readonly bg: Sprite;
  private readonly sequencer: Sequencer;

  // Other state
  private sequencerOptions: SequencerOptions;
  private readonly channel: ToneAudioNode;

  // References
  private updateMenu: () => void;

  constructor(world: WorldState, initializers: ResourceInitializers, updateMenu: () => void) {
    this.channel = new Compressor({
      threshold: -10,
      ratio: 5
    });
    this.channel.toDestination();
    this.channel.connect(initializers.analyserNode);
    const {dimensions} = world;

    Transport.bpm.value = 90;

    this.sequencerOptions = {
      bpm: 90,
      sequence: 'random'
    };
    this.bg = new OuterSpace(dimensions);
    this.sequencer = new Sequencer(this.sequencerOptions);
    this.updateMenu = updateMenu;
  }

  public sprites(): Sprite[] {
    return [this.bg];
  }

  public gameTick(world: WorldState) {}

  private updateSequencerOptions(options: SequencerOptions) {
    this.sequencerOptions = options;
    this.sequencer.setOptions(options);
    this.updateMenu();
  }

  public menu() {
    return (
      <div className='solo-menu'>
        <fieldset>
          <JsonSchemaForm
            value={this.sequencerOptions}
            onChange={this.updateSequencerOptions}
            schema={SequencerOptionsSchema}
          />
        </fieldset>
      </div>
    );
  }
}

export class SoloPreview implements Game {
  private readonly notes = new Set<NoteValue>();

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(world: WorldState) {}

  public sprites(): Sprite[] {
    return [];
  }
}

export const Solo: GameInfo = {
  title: 'Solo',
  url: '/solo',
  description: (
    <div>
      <p>Easy come, easy go; won't you let it snow?</p>
    </div>
  ),
  game: SoloGame,
  preview: SoloPreview
};
