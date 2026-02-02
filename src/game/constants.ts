// Game constants for Frontier

import { System, Route, SystemType, Commodity } from './types';

// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Starting values
export const STARTING_CREDITS = 100;
export const STARTING_LOCATION = 'lave';

// Ship defaults
export const SHIP_MAX_FUEL = 10;
export const SHIP_CARGO_CAPACITY = 10;
export const FUEL_COST_PER_LY = 2;

// Systems (5 for MVP)
export const SYSTEMS: System[] = [
  { id: 'lave', name: 'Lave', type: 'agricultural', x: 200, y: 150 },
  { id: 'leesti', name: 'Leesti', type: 'agricultural', x: 300, y: 80 },
  { id: 'diso', name: 'Diso', type: 'industrial', x: 100, y: 60 },
  { id: 'zaonce', name: 'Zaonce', type: 'hightech', x: 320, y: 180 },
  { id: 'riedquat', name: 'Riedquat', type: 'mining', x: 80, y: 220 },
];

// Routes (bidirectional)
export const ROUTES: Route[] = [
  { from: 'lave', to: 'leesti', distance: 3.1 },
  { from: 'lave', to: 'diso', distance: 4.2 },
  { from: 'lave', to: 'zaonce', distance: 4.0 },
  { from: 'lave', to: 'riedquat', distance: 5.5 },
  { from: 'leesti', to: 'diso', distance: 2.8 },
  { from: 'zaonce', to: 'leesti', distance: 3.5 },
];

// Base prices by system type
// Buy = what you pay, Sell = what station pays you
export const BASE_PRICES: Record<SystemType, Record<Commodity, { buy: number; sell: number }>> = {
  agricultural: {
    food: { buy: 4, sell: 3 },
    minerals: { buy: 15, sell: 12 },
    computers: { buy: 150, sell: 120 },
  },
  industrial: {
    food: { buy: 8, sell: 6 },
    minerals: { buy: 8, sell: 6 },
    computers: { buy: 100, sell: 80 },
  },
  mining: {
    food: { buy: 7, sell: 5 },
    minerals: { buy: 5, sell: 4 },
    computers: { buy: 140, sell: 110 },
  },
  hightech: {
    food: { buy: 6, sell: 5 },
    minerals: { buy: 12, sell: 10 },
    computers: { buy: 60, sell: 50 },
  },
};

// Price variance (±20%)
export const PRICE_VARIANCE = 0.2;

// Colors
export const COLORS = {
  background: '#0a0a14',
  agricultural: '#22aa22',
  industrial: '#aaaaaa',
  mining: '#aa8822',
  hightech: '#2288dd',
  routes: '#333355',
  player: '#ffffff',
  text: '#cccccc',
};

// Commodities list
export const COMMODITIES: Commodity[] = ['food', 'minerals', 'computers'];
