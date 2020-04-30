import React from 'react';
import {AudioData, Dimensions} from '../types';
import {Sprite} from './Sprite';
import {scale} from '../util/scale';
import {times} from 'lodash';

import './Spectrogram.scss';
import { getNoteName, Note } from '../util/Note';
import { midiNoteToFreq } from '../util/midi';

export class Spectrogram extends Sprite {
  public tick() {}

  public render(audio: AudioData, dimensions: Dimensions) {
    const {width, height} = dimensions;
    const {frequencies} = audio;

    const lines = times(frequencies.length, (idx: number) => {
      const amplitude = frequencies[idx];

      const x = scale({
        input: idx,
        inputMin: 0,
        inputMax: frequencies.length,
        outputMin: 0,
        outputMax: width,
        logarithmic: true
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

    const notes = times(128, (note: Note) => {
      const name = getNoteName(note);
      const freq = midiNoteToFreq(note);
      const x = scale({
        input: freq,
        inputMin: 0,
        inputMax: audio.hzPerIdx * frequencies.length,
        outputMin: 0,
        outputMax: width,
        logarithmic: true
      });

      return (
        <text x={x} y={height - 10}>
          {name}
        </text>
      )
    });

    return (
      <g className='spectrogram' key={this.id}>
        {lines}
        {notes}
      </g>
    );
  }
}
