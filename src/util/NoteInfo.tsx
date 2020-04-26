import React from 'react';
import { getNoteName } from './Note';


export interface NoteInfoProps {
  note: number; // MIDI note, 21 - 127
}

export class NoteInfo extends React.Component<NoteInfoProps> {
  public render() {
    const noteName = getNoteName(this.props.note);
    return noteName;
  }
}