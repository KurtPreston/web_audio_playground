import React from 'react';
import {SpriteRenderer, AudioData, INoteGrid} from '../types';

export const noteGridRenderer: SpriteRenderer<INoteGrid> = (state: INoteGrid, audio: AudioData): React.ReactElement<SVGElement> => {
  return (
    <g/>
  );
}
