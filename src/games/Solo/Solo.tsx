import {autobind} from 'core-decorators';
import {chunk, isFinite} from 'lodash';
import React from 'react';
import {Compressor, ToneAudioNode} from 'tone';
import {Chord} from '../../audio/chords';
import {Note, NoteValue} from '../../audio/Note';
import {Sequencer} from '../../audio/Sequencer/Sequencer';
import {SequencerOptions} from '../../audio/Sequencer/SequencerOptions.generated';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {ChordName} from '../../sprites/ChordName';
import {Keyboard} from '../../sprites/Keyboard';
import {Metronome} from '../../sprites/Metronome';
import {OuterSpace} from '../../sprites/OuterSpace';
import {noteNameAnnotator} from '../../sprites/SheetMusic/noteName';
import {drawSaxFingeringChart} from '../../sprites/SheetMusic/saxFingering';
import {SheetMusic} from '../../sprites/SheetMusic/SheetMusic';
import {Sprite} from '../../sprites/Sprite';
import {colorThemeSchema, SequencerOptionsSchema} from '../../types/schemas.generated';
import {WorldState} from '../../types/State';
import {ColorThemes} from '../../util/color';
import {ColorTheme} from '../../util/colorTheme.generated';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import './Solo.scss';

@autobind
export class SoloGame implements Game {
  // Sprites
  private readonly bg: Sprite;
  private readonly sequencer: Sequencer;
  private readonly sheetMusic: SheetMusic;
  private readonly chordName: ChordName;
  private readonly keyboard: Keyboard;
  private readonly metronome: Metronome;

  // Other state
  private sequencerOptions: SequencerOptions;
  private colorTheme: ColorTheme = 'rainbow';
  private readonly channel: ToneAudioNode;
  private loop: [number | null, number | null] = [null, null];

  // References
  private readonly updateMenu: () => void;
  private readonly sequencerSubscription: () => void;

  constructor(world: WorldState, initializers: ResourceInitializers, updateMenu: () => void) {
    this.channel = new Compressor({
      threshold: -10,
      ratio: 5
    });
    this.channel.toDestination();
    this.channel.connect(initializers.analyserNode);
    const {dimensions} = world;

    this.sequencerOptions = {
      bpm: 60,
      chart: 'majMin',
      melody: 'chord'
    };
    this.bg = new OuterSpace(dimensions);
    this.sequencer = new Sequencer(this.sequencerOptions);
    this.sheetMusic = new SheetMusic({
      sequencer: this.sequencer,
      noteAnnotators: [noteNameAnnotator, drawSaxFingeringChart],
      noteColor: this.noteColor
    });
    this.chordName = new ChordName(this.sequencer);
    this.metronome = new Metronome();
    const activeNotes = new Set<Note>();
    this.keyboard = new Keyboard(activeNotes);
    this.updateMenu = updateMenu;
    this.sequencerSubscription = this.sequencer.subscribe((chord: Chord) => {
      // Update menu
      this.updateMenu();

      // Setup keyboard link
      activeNotes.clear();
      chord.notes.forEach((note: Note) => activeNotes.add(note + 36));
    });
  }

  public sprites(): Sprite[] {
    return [this.bg, this.sheetMusic, this.chordName, this.keyboard, this.metronome];
  }

  public gameTick(world: WorldState) {}

  private updateSequencerOptions(options: SequencerOptions) {
    this.sequencerOptions = options;
    this.sequencer.setOptions(options);
    this.updateMenu();
  }

  private updateColorTheme(colorTheme: ColorTheme) {
    this.colorTheme = colorTheme;
    this.updateMenu();
  }

  private noteColor(note: Note) {
    return ColorThemes[this.colorTheme](note);
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
        <fieldset>
          <JsonSchemaForm
            value={this.colorTheme}
            onChange={this.updateColorTheme}
            schema={colorThemeSchema}
          />
        </fieldset>
        <fieldset>
          <label>Progression</label>
          <table>
            <tbody>
              {chunk(this.sequencer.chords, 4).map((chords, chunkIdx) => (
                <tr key={chunkIdx}>
                  {chords.map((chord, i) => {
                    const chordIdx = i + chunkIdx * 4;
                    const isCurrentChord = this.sequencer.idx === chordIdx;
                    const btnClass = [isCurrentChord && 'current-chord', 'chord-btn']
                      .filter(Boolean)
                      .join(' ');
                    const setChord = () => {
                      this.sequencer.setChordIdx(chordIdx);
                      this.updateMenu();
                    };

                    const [start, stop] = this.loop;
                    const cellIsLooping =
                      isFinite(start) &&
                      chordIdx >= (start as number) &&
                      isFinite(stop) &&
                      chordIdx <= (stop as number);
                    const cellStyle: React.CSSProperties = cellIsLooping
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }
                      : {};

                    return (
                      <td key={i} style={cellStyle}>
                        <button
                          className={btnClass}
                          onClick={setChord}
                          onMouseDown={(event) => this.setLoopStart(chordIdx)}
                          onMouseUp={() => this.setLoopEnd(chordIdx)}
                        >
                          {chord.name}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {this.sequencer.isLooping ? (
            <div className='clear-loop-btn'>
              <button onClick={this.clearLoop}>Clear Loop</button>
            </div>
          ) : null}
        </fieldset>
      </div>
    );
  }

  private setLoopStart(chordIdx: number) {
    this.loop[0] = chordIdx;
  }

  private setLoopEnd(chordIdx: number) {
    this.loop[1] = chordIdx;
    const [start, stop] = this.loop;
    if (isFinite(start) && isFinite(stop)) {
      if (stop > (start as number)) {
        this.sequencer.setLoop(start as number, stop);
      } else {
        this.loop = [null, null];
      }
    }
    this.updateMenu();
  }

  private clearLoop() {
    this.loop = [null, null];
    this.sequencer.clearLoop();
    this.updateMenu();
  }

  public destroy() {
    this.sequencerSubscription();
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
