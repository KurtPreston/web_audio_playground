import {Sprite} from '../sprites/Sprite';
import {WorldState} from '../types';

// Show game on a menu
export interface GameInfo {
  title: string;
  description: React.ReactNode;
  url: string;
  dataSources: GameDataSource[];
  game: {
    new (world: WorldState): Game;
  };
}

// Instance of a game
export interface Game {
  menu?: (world: WorldState) => React.ReactNode;
  gameTick?: (world: WorldState) => void;
  sprites: () => Sprite[];
  info: GameInfo;
}

export type GameDataSource = 'mic';
