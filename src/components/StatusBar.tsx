'use client';

import { Player } from '@/game/types';

interface StatusBarProps {
  player: Player;
}

export function StatusBar({ player }: StatusBarProps) {
  const { credits, ship, cargo } = player;
  const usedCargo = cargo.reduce((sum, item) => sum + item.quantity, 0);
  const fuelPercent = (ship.fuel / ship.maxFuel) * 100;

  return (
    <div className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-700">
      <div className="flex items-center gap-6">
        <div className="text-sm">
          <span className="text-gray-400">Credits: </span>
          <span className="text-yellow-400 font-bold">{credits.toLocaleString()} CR</span>
        </div>

        <div className="text-sm flex items-center gap-2">
          <span className="text-gray-400">Fuel: </span>
          <div className="w-24 h-3 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${fuelPercent}%` }}
            />
          </div>
          <span className="text-cyan-400">{ship.fuel.toFixed(1)} / {ship.maxFuel} LY</span>
        </div>

        <div className="text-sm">
          <span className="text-gray-400">Cargo: </span>
          <span className="text-green-400">{usedCargo} / {ship.cargoCapacity} t</span>
        </div>
      </div>
    </div>
  );
}
