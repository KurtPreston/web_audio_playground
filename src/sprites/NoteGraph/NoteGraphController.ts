import {NoteValue} from '../../audio/Note';
import {WorldState} from '../../types/State';
import {MicrophoneAudioSettings} from '../Microphone/MicrophoneAudioSettings.generated';

export interface NoteGraphController {
  tick: (world: WorldState) => void;
  destroy: () => void;
  actions: NoteGraphAction[][];
  controls?: () => React.ReactNode;
  noteValues: Set<NoteValue>;

  audioSettings: MicrophoneAudioSettings;
  updateAudioSettings?: (audioSettings: MicrophoneAudioSettings) => void;
}

export interface NoteGraphAction {
  name: string;
  action: () => void;
}
