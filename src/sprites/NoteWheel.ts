import {range} from 'lodash';
import tinycolor from 'tinycolor2';
import {CanvasBlendMode, IPosition, WorldState} from '../types';
import {getNoteInfo, Note} from '../util/Note';
import {Sprite} from './Sprite';

export interface NoteWheelParams {
  notes?: Note[];
  mixBlendMode?: CanvasBlendMode;
  size?: number;
}

export class NoteWheel extends Sprite {
  // State
  private position: IPosition = {
    x: -1000,
    y: -1000
  };
  public target: IPosition | null = null;

  // Constants
  private readonly notes: Note[];
  private readonly mixBlendMode: CanvasBlendMode;
  private readonly size: number;
  private readonly fontSize: number = 15;

  constructor(params: Partial<NoteWheelParams> = {}) {
    super();
    this.notes = params.notes || range(0, 12);
    this.mixBlendMode = params.mixBlendMode || 'soft-light';
    this.size = params.size || 120;
  }

  public setPosition(position: IPosition) {
    this.position = position;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {x, y} = this.position;

    const numNotes = this.notes.length;

    this.notes.forEach((note: Note, idx: number) => {
      // Note slice
      const color = tinycolor({
        h: (idx / numNotes) * 360,
        s: 1,
        l: 0.7
      });
      const {angleStart, angleCenter, angleStop} = this.noteSlice(idx);
      const noteIsSelected = world.audio.notes.map((note) => note % 12).includes(note);
      if (noteIsSelected) {
        canvas.globalCompositeOperation = 'source-over';
      } else {
        canvas.globalCompositeOperation = this.mixBlendMode;
      }

      canvas.beginPath();
      canvas.fillStyle = color.toHexString();
      canvas.moveTo(x, y);
      canvas.arc(x, y, this.size, angleStart, angleStop);
      canvas.lineTo(x, y);
      canvas.fill();
      canvas.closePath();

      // Note text
      const labelDistance = this.size * 0.8;
      const {letter, accidental} = getNoteInfo(note);
      canvas.fillStyle = 'white';
      canvas.font = noteIsSelected
        ? `bold ${this.fontSize * 1.25}px sans-serif`
        : `${this.fontSize}px sans-serif`;
      canvas.textAlign = 'center';
      canvas.fillText(
        `${letter}${accidental ? '♯' : ''}`,
        x + Math.cos(angleCenter) * labelDistance,
        y + Math.sin(angleCenter) * labelDistance
      );
    });
  }

  private noteSlice(noteIdx: number) {
    const numNotes = this.notes.length;
    const circleTop = (3 * Math.PI) / 2;
    const radiansPerSlice = (2 * Math.PI) / numNotes;
    const angleCenter = circleTop + noteIdx * radiansPerSlice;
    const angleStart = angleCenter - radiansPerSlice / 2;
    const angleStop = angleCenter + radiansPerSlice / 2;
    return {angleCenter, angleStart, angleStop};
  }

  public tick(world: WorldState) {
    const {x, y} = this.position;
    const notes: Note[] = world.audio.notes;
    if (notes.length) {
      const note: Note = notes[0] % 12;
      const noteIdx: number = this.notes.findIndex((n) => n === note);
      if (noteIdx >= 0) {
        const {angleCenter} = this.noteSlice(noteIdx);
        this.target = {
          x: x + Math.cos(angleCenter) * this.size,
          y: y + Math.sin(angleCenter) * this.size
        };
      } else {
        this.target = null;
      }
    } else {
      this.target = null;
    }
  }
}
