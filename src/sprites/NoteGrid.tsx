import classnames from 'classnames';
import {range} from 'lodash';
import React from 'react';
import {WorldState} from '../types';

import {midiNoteToFreq} from '../util/midi';
import {getNoteName, Note, NoteInfo} from '../util/Note';
import './NoteGrid.scss';
import {Sprite} from './Sprite';

export class NoteGrid extends Sprite {
  public tick() {}

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {audio, dimensions} = world;
    const {width, height} = dimensions;
    const lowOctave = 3;
    const highOctave = 8;
    const notes: Note[] = range((lowOctave + 1) * 12, (highOctave + 2) * 12);

    const colWidth = width / 12;
    const rowHeight = height / (highOctave - lowOctave + 1);

    const boxes = notes.map((note: Note, idx: number) => {
      const col = idx % 12;
      const row = Math.floor(idx / 12);
      const x = colWidth * col;
      const y = rowHeight * row;

      const noteAmplitude = audio.amplitudeAtNote(note);
      const isNote = audio.notes.find(({midi}: NoteInfo) => midi === note);

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

      return (
        <g key={note} className={className}>
          <rect key={note} x={x} y={y} width={colWidth} height={rowHeight} style={style} />
          <text x={cx} y={cy - 10}>
            {noteName}
          </text>
          <text x={cx} y={cy + 10}>
            {freq}
          </text>
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
