'use client';

import { useState } from 'react';
import { Player } from '@/game/types';
import { Music } from '@/game/Music';
import { Sound } from '@/game/Sound';

interface StatusBarProps {
  player: Player;
}

export function StatusBar({ player }: StatusBarProps) {
  const { credits, ship, cargo } = player;
  const [showAudio, setShowAudio] = useState(false);
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };
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

      {/* Audio Settings */}
      <div className="relative">
        <button
          onClick={() => setShowAudio(!showAudio)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
        >
          Audio
        </button>
        
        {showAudio && (
          <div className="absolute right-0 top-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg w-56 z-50">
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-400">Music</label>
                <button
                  onClick={toggleMusic}
                  className={`px-2 py-0.5 rounded text-xs ${
                    musicEnabled ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {musicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                disabled={!musicEnabled}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-400">Sound</label>
                <button
                  onClick={toggleSound}
                  className={`px-2 py-0.5 rounded text-xs ${
                    soundEnabled ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={soundVolume}
                onChange={handleSoundVolumeChange}
                disabled={!soundEnabled}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
