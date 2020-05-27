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

  // Constants
  private readonly notes: Note[];
  private readonly mixBlendMode: CanvasBlendMode;
  private readonly size: number;

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
    const circleTop = (3 * Math.PI) / 2;
    const radiansPerSlice = (2 * Math.PI) / numNotes;

    canvas.globalCompositeOperation = this.mixBlendMode;
    this.notes.forEach((note: Note, idx: number) => {
      // Note slice
      const color = tinycolor({
        h: (idx / numNotes) * 360,
        s: 1,
        l: 0.7
      });
      const angleCenter = circleTop + idx * radiansPerSlice;
      const angleStart = angleCenter - radiansPerSlice / 2;
      const angleStop = angleCenter + radiansPerSlice / 2;
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
      canvas.fillText(
        `${letter}${accidental ? '♯' : ''}`,
        x + Math.cos(angleCenter) * labelDistance,
        y + Math.sin(angleCenter) * labelDistance
      );
    });
  }

  public tick(world: WorldState) {}
}
