import {Context as AudioContext} from 'tone';
import {Sprite} from '../sprites/Sprite';
import {WorldState} from '../types/State';

// Show game on a menu
export interface GameInfo {
  title: string;
  description: React.ReactNode;
  url: string;
  dataSources: GameDataSource[];
  game: GameClass;
}

export interface GameClass {
  new (world: WorldState, initializers: ResourceInitializers, refreshMenu: () => void): Game;
}

export interface ResourceInitializers {
  mic: () => void;
  deviceOrientation: () => void;
  audioContext: AudioContext;
  analyserNode: AnalyserNode;
}

// Instance of a game
export interface Game {
  menu?: () => React.ReactNode;
  gameTick?: (world: WorldState) => void;
  sprites: () => Sprite[];
  info: GameInfo;
}

export type GameDataSource = 'mic';
