import {autobind} from 'core-decorators';
import Vex from 'vexflow';
import {getNoteInfo, Note, NoteAccidental, NoteInfo} from '../../audio/Note';
import {MelodyNote} from '../../audio/Sequencer/melody';
import {Sequencer} from '../../audio/Sequencer/Sequencer';
import {WorldState} from '../../types/State';
import {Sprite} from '../Sprite';

export interface SheetMusicProps {
  sequencer: Sequencer;
  noteAnnotators: NoteAnnotator[];
}

export interface NoteAnnotatorParams {
  canvas: CanvasRenderingContext2D;
  note: Note;
  accidental: NoteAccidental;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type NoteAnnotator = {
  name: string;
  height: number;
  render: (params: NoteAnnotatorParams) => void;
};

const beatsToDurationMap: {[beats: number]: string} = {
  1: 'q',
  2: 'h',
  4: 'w'
};

@autobind
export class SheetMusic implements Sprite {
  private readonly vexCanvasContext: Vex.Flow.CanvasContext;
  private readonly sequencer: Sequencer;
  private readonly noteAnnotators: NoteAnnotator[];
  private readonly canvasScale: number = 1.25; // Increase size

  constructor(params: SheetMusicProps) {
    const canvasEl: HTMLCanvasElement = document.querySelector('.game canvas') as HTMLCanvasElement;
    this.vexCanvasContext = Vex.Flow.Renderer.getCanvasContext(
      canvasEl,
      Vex.Flow.Renderer.Backends.CANVAS
    );
    this.sequencer = params.sequencer;
    this.noteAnnotators = params.noteAnnotators;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {vexCanvasContext} = this;
    const {chord, measureMelody} = this.sequencer;
    const notes = measureMelody;
    const chordAccidental = chord.accidental;
    const x = world.dimensions.width / (2 * this.canvasScale);
    const y = 50 / this.canvasScale;
    const width = Math.min(
      world.dimensions.width / (2 * this.canvasScale) - 50,
      350 / this.canvasScale
    );

    // Styles
    vexCanvasContext.scale(1.25, 1.25);
    vexCanvasContext.setFillStyle('white');
    vexCanvasContext.setStrokeStyle('white');

    // Draw clef
    const stave = new Vex.Flow.Stave(x, y, width);
    // const {octave}: NoteInfo = getNoteInfo(notes[0], '#');
    // const clef = octave <= 3 ? 'bass' : 'treble';
    const clef = 'treble';
    stave.addClef(clef);
    stave.setContext(vexCanvasContext).draw();

    // Draw notes
    const vexNotes: Vex.Flow.StaveNote[] = notes.map(
      ({note, beats}: MelodyNote): Vex.Flow.StaveNote => {
        const {letter, accidental, octave}: NoteInfo = getNoteInfo(note, chordAccidental);
        const noteName = `${letter}/${octave}`;

        const duration = beatsToDurationMap[beats];
        if (!duration) {
          throw new Error(`No Vex symbol set for ${beats} beats`);
        }
        const vexNote = new Vex.Flow.StaveNote({
          clef,
          keys: [noteName],
          duration,
          auto_stem: true
        });

        if (accidental) {
          vexNote.addAccidental(0, new Vex.Flow.Accidental(accidental));
        }

        return vexNote;
      }
    );

    const voice = new Vex.Flow.Voice({num_beats: vexNotes.length, beat_value: 4});
    voice.setStrict(false); // <--- but why?
    voice.addTickables(vexNotes);
    const formatter = new Vex.Flow.Formatter();
    formatter.joinVoices([voice]).format([voice], width);
    voice.draw(vexCanvasContext, stave);

    // Draw annotations beneath notes
    let annotatorY = stave.getBottomY();
    const annotatorWidth = width / (2 * notes.length + 1);
    for (const noteAnnotator of this.noteAnnotators) {
      const annotatorHeight = noteAnnotator.height;
      for (const [i, vexNote] of vexNotes.entries()) {
        const note = notes[i].note;
        const annotatorX = vexNote.getAbsoluteX() + vexNote.getWidth() / 2;

        noteAnnotator.render({
          x: annotatorX,
          y: annotatorY,
          accidental: chordAccidental,
          canvas,
          note,
          width: annotatorWidth,
          height: annotatorHeight
        });
      }
      annotatorY += annotatorHeight;
    }
  }

  public tick(world: WorldState): void {}

  public destroy() {}
}
