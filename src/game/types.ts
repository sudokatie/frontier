// Core types for Frontier

export type Commodity = 'food' | 'minerals' | 'computers';

export type SystemType = 'agricultural' | 'industrial' | 'mining' | 'hightech';

export interface System {
  id: string;
  name: string;
  type: SystemType;
  x: number;
  y: number;
}

export interface Route {
  from: string;
  to: string;
  distance: number; // LY
}

export interface Galaxy {
  systems: System[];
  routes: Route[];
}

export interface MarketPrices {
  food: { buy: number; sell: number };
  minerals: { buy: number; sell: number };
  computers: { buy: number; sell: number };
}

export interface Ship {
  fuel: number;
  maxFuel: number;
  cargoCapacity: number;
}

export interface CargoItem {
  commodity: Commodity;
  quantity: number;
  purchasePrice: number;
}

export interface Player {
  credits: number;
  location: string;
  ship: Ship;
  cargo: CargoItem[];
}

export type GameView = 'station' | 'galaxy' | 'jumping';

export interface GameState {
  player: Player;
  galaxy: Galaxy;
  view: GameView;
  selectedSystem: string | null;
}
