import {range} from 'lodash';
import {AudioData, IPosition, WorldState} from '../types';

import {midiNoteToFreq} from '../audio/midi';
import {getNoteFrequencyRange, getNoteName, Note} from '../audio/Note';
import {OverflowMode, scale} from '../math/scale';
import {Sprite} from './Sprite';

export interface NoteGridParams {
  lowOctave: number;
  highOctave: number;
  showPitchIndicator: boolean;
  showFrequency: boolean;
  showNoteAmplitude: boolean;
}

const noteGridParamDefaults: NoteGridParams = {
  lowOctave: 2,
  highOctave: 6,
  showPitchIndicator: false,
  showFrequency: true,
  showNoteAmplitude: true
};

export class NoteGrid extends Sprite {
  public peakFreqPosition: IPosition | null = null;
  private readonly lowOctave: number;
  private readonly highOctave: number;
  private readonly showPitchIndicator: boolean;
  private readonly showFrequency: boolean;
  private readonly showNoteAmplitude: boolean;

  private colWidth: number = 0;
  private rowHeight: number = 0;

  constructor(params: Partial<NoteGridParams>) {
    super();
    const {lowOctave, highOctave, showPitchIndicator, showFrequency, showNoteAmplitude} = {
      ...noteGridParamDefaults,
      ...params
    };
    this.lowOctave = lowOctave;
    this.highOctave = highOctave;
    this.showPitchIndicator = showPitchIndicator;
    this.showFrequency = showFrequency;
    this.showNoteAmplitude = showNoteAmplitude;
  }

  public tick(world: WorldState) {
    const {width, height} = world.dimensions;
    const {peakFreq, notes} = world.audio;
    const {lowOctave, highOctave} = this;

    // Adjust width & height to dimensions
    this.colWidth = width / 12;
    this.rowHeight = height / (highOctave - lowOctave + 1);

    // Set peakFreqIndicator
    if (notes.length && peakFreq) {
      const note: Note = notes[0];
      const [lowFreq, highFreq] = getNoteFrequencyRange(note);
      const {xMin, xMax, yMin, yMax} = this.notePosition(note);
      const x = scale({
        input: peakFreq,
        inputMin: lowFreq,
        inputMax: highFreq,
        outputMin: xMin,
        outputMax: xMax,
        overflowMode: OverflowMode.Overflow
      });
      const y = (yMin + yMax) / 2;

      this.peakFreqPosition = {
        x,
        y
      };
    }
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {lowOctave, highOctave} = this;
    const {audio} = world;
    const notes: Note[] = range((lowOctave + 1) * 12, (highOctave + 2) * 12);
    notes.forEach((note: Note) => this.drawNoteBox(note, audio, canvas));

    if (this.peakFreqPosition && audio.peakFreq && this.showPitchIndicator) {
      this.drawPeakFreq(canvas);
    }
  }

  private notePosition(note: Note) {
    const col = note % 12;
    const row = Math.floor(note / 12 - this.lowOctave - 1);
    const xMin = this.colWidth * col;
    const yMin = this.rowHeight * row;
    const xMax = xMin + this.colWidth;
    const yMax = yMin + this.rowHeight;

    return {
      col,
      row,
      xMin,
      xMax,
      yMin,
      yMax
    };
  }

  private drawNoteBox(note: Note, audio: AudioData, canvas: CanvasRenderingContext2D) {
    const {colWidth, rowHeight} = this;
    const {xMin, yMin} = this.notePosition(note);
    const {amplitudeAtNote, notes} = audio;
    const noteAmplitude = amplitudeAtNote(note);
    const isNote = notes.includes(note);

    const noteName = getNoteName(note);
    const freq = Math.round(midiNoteToFreq(note));

    const cx = xMin + colWidth / 2;
    const cy = yMin + rowHeight / 2;

    // Draw rectangle
    if (isNote) {
      canvas.fillStyle = 'lightblue';
      canvas.globalAlpha = 1;
    } else if (this.showNoteAmplitude) {
      canvas.fillStyle = 'white';
      canvas.globalAlpha = noteAmplitude;
    } else {
      canvas.globalAlpha = 0;
    }
    canvas.fillRect(xMin, yMin, colWidth, rowHeight);

    // Draw text
    canvas.fillStyle = 'white';
    canvas.globalAlpha = 1;
    canvas.textAlign = 'center';
    if (isNote) {
      canvas.font = 'bold 45px Arial';
    } else {
      canvas.font = '25px Arial';
    }

    if (this.showFrequency) {
      canvas.textBaseline = 'bottom';
      canvas.fillText(noteName, cx, cy - 5, colWidth);
      canvas.textBaseline = 'top';
      canvas.fillText(freq.toString(), cx, cy + 5, colWidth);
    } else {
      canvas.textBaseline = 'middle';
      canvas.fillText(noteName, cx, cy, colWidth);
    }
  }

  private drawPeakFreq(canvas: CanvasRenderingContext2D) {
    const {peakFreqPosition} = this;
    if (!peakFreqPosition) {
      return;
    }
    const {x, y} = peakFreqPosition;
    canvas.beginPath();
    canvas.arc(x, y, 5, 0, 2 * Math.PI);
    canvas.fill();
    //   peakFreqCircle = (
    //     <g className='peak-freq'>
    //       <circle cx={x} cy={y} r={5} />;
    //       <text x={x} y={y + 40}>
    //         {Math.round(peakFreq)}
    //       </text>
    //     </g>
    //   );
    // }
    // return (
    //   <g key={this.id} className='note-grid'>
    //     {boxes}
    //     {peakFreqCircle}
    //   </g>
    // );
  }
}
