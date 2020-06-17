import {range} from 'lodash';
import tinycolor from 'tinycolor2';
import {getNoteInfo, Note, noteAccidental} from '../audio/Note';
import {MidiNoteBus} from '../midi/MidiNoteBus';
import {WorldState} from '../types/State';
import {noteColor} from './renderHelpers/noteColor';
import {Sprite} from './Sprite';

export class Keyboard implements Sprite {
  constructor(private readonly noteBus: MidiNoteBus) {}

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {width, height} = world.dimensions;
    const whiteKeyHeight = 60;
    const blackKeyHeight = whiteKeyHeight * 0.5;

    const startY = height - whiteKeyHeight;

    // Standard piano range:  A0 to C88
    const notes: Note[] = range(21, 108);
    const numWhiteKeys = notes.filter((note) => !noteAccidental(note)).length;

    const whiteKeyWidth = width / numWhiteKeys;

    canvas.textAlign = 'center';

    const activeNotes = this.noteBus.notes;

    // Draw white keys
    let startX = 0;
    notes.forEach((note: Note) => {
      const {accidental, letter} = getNoteInfo(note);
      if (!accidental) {
        const color = activeNotes.has(note) ? noteColor(note, 0.7) : 'white';
        canvas.fillStyle = color;
        canvas.strokeStyle = 'black';
        canvas.fillRect(startX, startY, whiteKeyWidth, whiteKeyHeight);
        canvas.strokeRect(startX, startY, whiteKeyWidth, whiteKeyHeight);

        canvas.fillStyle = tinycolor(color).isDark() ? 'white' : 'black';
        canvas.fillText(
          `${letter}${accidental || ''}`,
          startX + whiteKeyWidth / 2,
          height - 10,
          whiteKeyWidth
        );

        startX += whiteKeyWidth;
      }
    });

    startX = 0;
    const blackKeyWidthRatio = 3 / 4;
    const blackKeyWidth = whiteKeyWidth * blackKeyWidthRatio;
    notes.forEach((note: Note) => {
      const {letter, accidental} = getNoteInfo(note, 'b');
      if (accidental) {
        // Black key
        const color = activeNotes.has(note) ? noteColor(note, 0.7) : 'black';
        canvas.fillStyle = color;
        canvas.strokeStyle = 'white';
        canvas.fillRect(startX - blackKeyWidth / 2, startY, blackKeyWidth, blackKeyHeight);

        canvas.fillStyle = tinycolor(color).isDark() ? 'white' : 'black';
        canvas.fillText(`${letter}${accidental || ''}`, startX, height - 40, blackKeyWidth);
      } else {
        startX += whiteKeyWidth;
      }
    });
  }

  public tick(world: WorldState) {}

  public destroy() {}
}
