'use client';

import { Player, MarketPrices, System, Commodity } from '@/game/types';
import { FUEL_COST_PER_LY } from '@/game/constants';
import { StatusBar } from './StatusBar';
import { MarketPanel } from './MarketPanel';
import { CargoPanel } from './CargoPanel';

interface StationViewProps {
  player: Player;
  market: MarketPrices | null;
  system: System | undefined;
  onBuy: (commodity: Commodity, quantity: number) => void;
  onSell: (commodity: Commodity, quantity: number) => void;
  onRefuel: () => void;
  onLaunch: () => void;
}

export function StationView({
  player,
  market,
  system,
  onBuy,
  onSell,
  onRefuel,
  onLaunch,
}: StationViewProps) {
  const fuelNeeded = player.ship.maxFuel - player.ship.fuel;
  const fuelCost = Math.ceil(fuelNeeded * FUEL_COST_PER_LY);

  return (
    <div className="h-full flex flex-col gap-4">
      <StatusBar player={player} />

      <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
        <div>
          <h1 className="text-xl font-bold text-white">{system?.name || 'Unknown'} Station</h1>
          <p className="text-gray-400 text-sm capitalize">{system?.type} economy</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefuel}
            disabled={fuelNeeded <= 0 || player.credits < fuelCost}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded"
          >
            Refuel ({fuelCost} CR)
          </button>
          <button
            onClick={onLaunch}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded"
          >
            Launch
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        <MarketPanel
          market={market}
          player={player}
          onBuy={onBuy}
          onSell={onSell}
        />
        <CargoPanel
          cargo={player.cargo}
          market={market}
        />
      </div>
    </div>
  );
}
