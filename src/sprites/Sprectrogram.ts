import {Sprite} from './Sprite';

import {times} from 'lodash';
import {freqToMidiNote} from '../audio/midi';
import {getNoteName, Note} from '../audio/Note';
import {scale} from '../math/scale';
import {WorldState} from '../types';

export class Spectrogram implements Sprite {
  public tick() {}

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {audio, dimensions} = world;
    const {width, height} = dimensions;
    const {hzPerIdx, frequencies} = audio;
    const maxFreq = (frequencies.length - 1) * hzPerIdx;
    const maxNote = Math.floor(freqToMidiNote(maxFreq));
    times(frequencies.length, (idx: number) => {
      const amplitude = frequencies[idx];
      const freq = (idx + 0.5) * hzPerIdx;
      const midiNote = freqToMidiNote(freq);
      const x = scale({
        input: midiNote,
        inputMin: 0,
        inputMax: maxNote,
        outputMin: 0,
        outputMax: width
      });
      const y = scale({
        input: amplitude,
        inputMin: 0,
        inputMax: 255,
        outputMin: height,
        outputMax: 0,
        logarithmic: true
      });

      canvas.strokeStyle = 'white';
      canvas.lineWidth = 3;
      canvas.beginPath();
      canvas.moveTo(x, height);
      canvas.lineTo(x, y);
      canvas.stroke();
      canvas.closePath();
    });
    times(maxNote, (note: Note) => {
      if (!(note % 12 === 0)) {
        return null;
      }
      const name = getNoteName(note);
      const x = scale({
        input: note,
        inputMin: 0,
        inputMax: maxNote,
        outputMin: 0,
        outputMax: width
      });
      canvas.textBaseline = 'bottom';
      canvas.fillText(name, x, height - 10);
    });
  }
}
