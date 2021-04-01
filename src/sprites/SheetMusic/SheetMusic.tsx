import {autobind} from 'core-decorators';
import Vex from 'vexflow';
import {getNoteInfo, Note, NoteInfo} from '../../audio/Note';
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
  x: number;
  y: number;
  width: number;
  height: number;
}

export type NoteAnnotator = (params: NoteAnnotatorParams) => void;

@autobind
export class SheetMusic implements Sprite {
  private readonly vexCanvasContext: Vex.Flow.CanvasContext;
  private readonly sequencer: Sequencer;
  private readonly noteAnnotators: NoteAnnotator[];

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
    const notes: Note[] = this.sequencer.chord.notes.map((note: Note) => note + 5 * 12);
    const [x, y] = [300, 100];
    const width = 200;

    // Styles
    vexCanvasContext.setFillStyle('white');
    vexCanvasContext.setStrokeStyle('white');

    // Draw clef
    const {octave}: NoteInfo = getNoteInfo(notes[0], '#');
    const stave = new Vex.Flow.Stave(x, y, width);
    const clef = octave <= 3 ? 'bass' : 'treble';
    stave.addClef(clef);
    stave.setContext(vexCanvasContext).draw();

    // Draw notes
    const vexNotes: Vex.Flow.StaveNote[] = notes.map(
      (note: Note): Vex.Flow.StaveNote => {
        const {letter, accidental, octave}: NoteInfo = getNoteInfo(note, '#');
        const noteName = `${letter}/${octave}`;
        const vexNote = new Vex.Flow.StaveNote({
          clef,
          keys: [noteName],
          duration: 'q',
          auto_stem: true
        });

        if (accidental) {
          vexNote.addAccidental(0, new Vex.Flow.Accidental(accidental));
          // const alternateNoteInfo: NoteInfo = getNoteInfo(note, 'b');
          // const alternateNote = new Vex.Flow.StaveNote({
          //   clef,
          //   keys: [`${alternateNoteInfo.letter}/${alternateNoteInfo.octave}`],
          //   duration: 'q',
          //   auto_stem: true
          // });
          // alternateNote.addAccidental(
          //   0,
          //   new Vex.Flow.Accidental(alternateNoteInfo.accidental as '#' | 'b')
          // );
          // vexNotes.push(alternateNote);
        }

        return vexNote;
      }
    );

    const voice = new Vex.Flow.Voice({num_beats: vexNotes.length, beat_value: 4});
    voice.addTickables(vexNotes);
    const formatter = new Vex.Flow.Formatter();
    formatter.joinVoices([voice]).format([voice], width);
    voice.draw(vexCanvasContext, stave);

    // Draw annotations beneath notes
    let annotatorY = y + stave.getHeight();
    const annotatorWidth = width / (2 * notes.length + 1);
    const annotatorHeight = 50;
    for (const noteAnnotator of this.noteAnnotators) {
      annotatorY += annotatorHeight;
      for (const [i, vexNote] of vexNotes.entries()) {
        const note = notes[i];
        noteAnnotator({
          x: vexNote.getAbsoluteX(),
          y: annotatorY,
          canvas,
          note,
          width: annotatorWidth,
          height: annotatorHeight
        });
      }
    }
  }

  public tick(world: WorldState): void {}

  public destroy() {}
}
