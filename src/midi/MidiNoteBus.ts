// The MidiNoteBus allows some sources to publish MidiNotes and others to subscribe

import {Note} from '../audio/Note';

export interface MidiNoteTrigger {
  note: Note;
  velocity: number; // if 0, note is released
}

export interface MidiNoteEvent extends MidiNoteTrigger {
  notes: Set<Note>;
}

export type MidiNoteSubscriber = (event: MidiNoteEvent) => void;
export type MidiNotePublish = (trigger: MidiNoteTrigger) => void;

export type MidiNoteSubscribe = (callback: MidiNoteSubscriber) => UnsubscribeFn;
export type UnsubscribeFn = () => void;

export class MidiNoteBus {
  public readonly notes = new Set<Note>();
  private readonly subscribers = new Set<MidiNoteSubscriber>();

  public reset() {
    this.notes.forEach((note) => {
      this.publish({
        note,
        velocity: 0
      });
    });
  }

  public publish: MidiNotePublish = (trigger: MidiNoteTrigger) => {
    if (trigger.velocity) {
      this.notes.add(trigger.note);
    } else {
      this.notes.delete(trigger.note);
    }
    const event: MidiNoteEvent = {
      ...trigger,
      notes: this.notes
    };
    this.subscribers.forEach((subscriber) => subscriber(event));
  };

  public subscribe: MidiNoteSubscribe = (callback: MidiNoteSubscriber): UnsubscribeFn => {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  };
}
