import {range} from 'lodash';
import {getNoteInfo, Note, noteAccidental} from '../audio/Note';
import {MidiNoteBus} from '../midi/MidiNoteBus';
import {WorldState} from '../types/State';
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

    const keyWidth = width / numWhiteKeys;

    canvas.textAlign = 'center';

    const activeNotes = this.noteBus.notes;

    // Draw white keys
    let startX = 0;
    notes.forEach((note: Note) => {
      const {accidental, letter} = getNoteInfo(note);
      if (!accidental) {
        canvas.fillStyle = activeNotes.has(note) ? 'blue' : 'white';
        canvas.strokeStyle = 'black';
        canvas.fillRect(startX, startY, keyWidth, whiteKeyHeight);
        canvas.strokeRect(startX, startY, keyWidth, whiteKeyHeight);

        canvas.fillStyle = 'black';
        canvas.fillText(
          `${letter}${accidental || ''}`,
          startX + keyWidth / 2,
          height - 10,
          keyWidth
        );

        startX += keyWidth;
      }
    });

    startX = 0;
    notes.forEach((note: Note) => {
      const {letter, accidental} = getNoteInfo(note, 'b');
      if (accidental) {
        // Black key
        canvas.fillStyle = activeNotes.has(note) ? 'blue' : 'black';
        canvas.strokeStyle = 'white';
        canvas.fillRect(startX - keyWidth / 2, startY, keyWidth, blackKeyHeight);
        canvas.strokeRect(startX - keyWidth / 2, startY, keyWidth, blackKeyHeight);

        canvas.fillStyle = 'white';
        canvas.fillText(`${letter}${accidental || ''}`, startX, height - 40, keyWidth);
      } else {
        startX += keyWidth;
      }
    });
  }

  public tick(world: WorldState) {}

  public destroy() {}
}
