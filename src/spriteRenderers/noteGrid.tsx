import React from 'react';
import {SpriteRenderer, AudioData, INoteGrid, Dimensions} from '../types';
import { range } from 'lodash';
import { Note, getNoteName, getNoteFrequencyRange, NoteInfo } from '../util/Note';
// import { randomColor } from '../util/color';
import './noteGrid.scss';

export const noteGridRenderer: SpriteRenderer<INoteGrid> = (state: INoteGrid, audio: AudioData, dimensions: Dimensions): React.ReactElement<SVGElement> => {
  const {width, height} = dimensions;
  const lowOctave = 2;
  const highOctave = 7;
  const notes: Note[] = range(lowOctave * 12, (highOctave + 2) * 12);

  const colWidth = width / 12;
  const rowHeight = height / (highOctave - lowOctave + 1);

  const boxes = notes.map((note: Note, idx: number) => {
    const col = idx % 12;
    const row = Math.floor(idx / 12);
    const x = colWidth * col;
    const y = rowHeight * row;

    const noteAmplitude = audio.amplitudeAtNote(note);
    const isNote = audio.notes.find(({midi}: NoteInfo) => midi === note);

    const style: React.CSSProperties = {
      fill: isNote
        ? 'lightblue'
        : 'white',
      opacity: isNote
        ? 1
        : noteAmplitude
    };

    const noteName = getNoteName(note);
    const [lowFreq, highFreq] = getNoteFrequencyRange(note);

    return (
      <g key={note}>
        <text x={x} y={y - 20} width={colWidth} height={rowHeight}>
          {noteName}
        </text>
        <text x={x} y={y} width={colWidth} height={rowHeight}>
          {Math.round(lowFreq)}—{Math.round(highFreq)}
        </text>
        <rect key={note} x={x} y={y} width={colWidth} height={rowHeight} style={style}/>
      </g>
    );
  });

  return (
    <g className='note-grid'>
      {boxes}
    </g>
  );
}
