'use client';

import { useState } from 'react';
import { Commodity, MarketPrices, Player } from '@/game/types';

interface MarketPanelProps {
  market: MarketPrices | null;
  player: Player;
  onBuy: (commodity: Commodity, quantity: number) => void;
  onSell: (commodity: Commodity, quantity: number) => void;
}

const COMMODITIES: Commodity[] = ['food', 'minerals', 'computers'];

export function MarketPanel({ market, player, onBuy, onSell }: MarketPanelProps) {
  const [quantities, setQuantities] = useState<Record<Commodity, number>>({
    food: 1,
    minerals: 1,
    computers: 1,
  });

  if (!market) {
    return (
      <div className="bg-gray-900 p-4 rounded border border-gray-700">
        <p className="text-gray-500">No market available</p>
      </div>
    );
  }

  const getCargoQuantity = (commodity: Commodity): number => {
    const item = player.cargo.find(c => c.commodity === commodity);
    return item?.quantity || 0;
  };

  const getCargoSpace = (): number => {
    const used = player.cargo.reduce((sum, item) => sum + item.quantity, 0);
    return player.ship.cargoCapacity - used;
  };

  const canBuy = (commodity: Commodity, qty: number): boolean => {
    const price = market[commodity].buy * qty;
    return price <= player.credits && qty <= getCargoSpace();
  };

  const canSell = (commodity: Commodity, qty: number): boolean => {
    return qty <= getCargoQuantity(commodity);
  };

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-lg font-bold text-white mb-3">Market</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-left py-2">Commodity</th>
            <th className="text-right">Buy</th>
            <th className="text-right">Sell</th>
            <th className="text-center">Qty</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {COMMODITIES.map(commodity => {
            const prices = market[commodity];
            const qty = quantities[commodity];
            const owned = getCargoQuantity(commodity);

            return (
              <tr key={commodity} className="border-b border-gray-800">
                <td className="py-2 text-white capitalize">{commodity}</td>
                <td className="text-right text-cyan-400">{prices.buy} CR</td>
                <td className="text-right text-yellow-400">{prices.sell} CR</td>
                <td className="text-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={qty}
                    onChange={e => setQuantities(prev => ({
                      ...prev,
                      [commodity]: Math.max(1, parseInt(e.target.value) || 1),
                    }))}
                    className="w-12 bg-gray-800 text-white text-center rounded px-1 py-0.5"
                  />
                </td>
                <td className="text-center space-x-1">
                  <button
                    onClick={() => onBuy(commodity, qty)}
                    disabled={!canBuy(commodity, qty)}
                    className="px-2 py-0.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs rounded"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => onSell(commodity, qty)}
                    disabled={!canSell(commodity, qty)}
                    className="px-2 py-0.5 bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs rounded"
                  >
                    Sell
                  </button>
                  <span className="text-gray-500 text-xs ml-1">({owned})</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
