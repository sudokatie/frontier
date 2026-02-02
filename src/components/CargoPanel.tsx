'use client';

import { CargoItem, MarketPrices } from '@/game/types';

interface CargoPanelProps {
  cargo: CargoItem[];
  market: MarketPrices | null;
}

export function CargoPanel({ cargo, market }: CargoPanelProps) {
  const getProfit = (item: CargoItem): number => {
    if (!market) return 0;
    const sellPrice = market[item.commodity].sell;
    return (sellPrice - item.purchasePrice) * item.quantity;
  };

  const totalValue = cargo.reduce((sum, item) => {
    if (!market) return sum;
    return sum + market[item.commodity].sell * item.quantity;
  }, 0);

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-lg font-bold text-white mb-3">Cargo Hold</h2>

      {cargo.length === 0 ? (
        <p className="text-gray-500 text-sm">Empty</p>
      ) : (
        <div className="space-y-2">
          {cargo.map((item, idx) => {
            const profit = getProfit(item);
            const profitColor = profit > 0 ? 'text-green-400' : profit < 0 ? 'text-red-400' : 'text-gray-400';

            return (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-white capitalize">{item.commodity}</span>
                <span className="text-gray-400">{item.quantity} t</span>
                <span className={profitColor}>
                  {profit >= 0 ? '+' : ''}{profit.toLocaleString()} CR
                </span>
              </div>
            );
          })}

          {cargo.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-sm">
              <span className="text-gray-400">Total Value:</span>
              <span className="text-yellow-400 font-bold">{totalValue.toLocaleString()} CR</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
