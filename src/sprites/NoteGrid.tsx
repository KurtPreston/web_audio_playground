import classnames from 'classnames';
import {range} from 'lodash';
import React from 'react';
import {WorldState} from '../types';

import {midiNoteToFreq} from '../util/midi';
import {getNoteFrequencyRange, getNoteName, Note} from '../util/Note';
import {OverflowMode, scale} from '../util/scale';
import './NoteGrid.scss';
import {Sprite} from './Sprite';

export class NoteGrid extends Sprite {
  public tick() {}

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {audio, dimensions} = world;
    const {width, height} = dimensions;
    const lowOctave = 2;
    const highOctave = 6;
    const notes: Note[] = range((lowOctave + 1) * 12, (highOctave + 2) * 12);

    const colWidth = width / 12;
    const rowHeight = height / (highOctave - lowOctave + 1);

    const boxes = notes.map((note: Note, idx: number) => {
      const col = idx % 12;
      const row = Math.floor(idx / 12);
      const x = colWidth * col;
      const y = rowHeight * row;

      const {peakFreq, amplitudeAtNote, notes} = audio;
      const noteAmplitude = amplitudeAtNote(note);
      const isNote = notes.includes(note);

      const style: React.CSSProperties = isNote
        ? {}
        : {
            opacity: noteAmplitude
          };

      const noteName = getNoteName(note);
      const freq = Math.round(midiNoteToFreq(note));

      const cx = x + colWidth / 2;
      const cy = y + rowHeight / 2;

      const className = classnames({
        'note-grid-cell': true,
        active: isNote
      });

      let peakFreqCircle: React.ReactNode = null;

      if (isNote && peakFreq) {
        const [inputMin, inputMax] = getNoteFrequencyRange(note);
        const xOffset = scale({
          input: peakFreq,
          inputMin,
          inputMax,
          outputMin: 0,
          outputMax: colWidth,
          overflowMode: OverflowMode.Overflow
        });
        peakFreqCircle = <circle cx={cx + xOffset} cy={cy + 20} r={5} className='peak-freq' />;
      }

      return (
        <g key={note} className={className}>
          <rect key={note} x={x} y={y} width={colWidth} height={rowHeight} style={style} />
          <text x={cx} y={cy - 10}>
            {noteName}
          </text>
          <text x={cx} y={cy + 10}>
            {freq}
          </text>
          {peakFreqCircle}
        </g>
      );
    });

    return (
      <g key={this.id} className='note-grid'>
        {boxes}
      </g>
    );
  }
}
