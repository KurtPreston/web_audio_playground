import {times} from 'lodash';
import React from 'react';
import {AudioData, Dimensions} from '../types';
import {scale} from '../util/scale';
import {Sprite} from './Sprite';

import {freqToMidiNote} from '../util/midi';
import {getNoteName, Note} from '../util/Note';
import './Spectrogram.scss';

export class Spectrogram extends Sprite {
  public tick() {}

  public render(audio: AudioData, dimensions: Dimensions) {
    const {width, height} = dimensions;
    const {hzPerIdx, frequencies} = audio;

    const maxFreq = (frequencies.length - 1) * hzPerIdx;
    const maxNote = Math.floor(freqToMidiNote(maxFreq));

    const lines = times(frequencies.length, (idx: number) => {
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

      return <line key={idx} x1={x} y1={height} x2={x} y2={y} />;
    });

    const notes = times(maxNote, (note: Note) => {
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

      return (
        <text key={note} x={x} y={height - 10}>
          {name}
        </text>
      );
    });

    return (
      <g className='spectrogram' key={this.id}>
        {lines}
        {notes}
      </g>
    );
  }
}
