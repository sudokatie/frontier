// Tests for Frontier leaderboard

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard,
  LeaderboardEntry,
} from '../game/Leaderboard';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLeaderboard', () => {
    it('returns empty array when no entries', () => {
      expect(getLeaderboard()).toEqual([]);
    });

    it('returns stored entries', () => {
      const entry: LeaderboardEntry = {
        name: 'Trader',
        credits: 50000,
        systemsVisited: 10,
        date: '2026-02-16',
      };
      addEntry(entry);
      expect(getLeaderboard()).toHaveLength(1);
      expect(getLeaderboard()[0].name).toBe('Trader');
    });
  });

  describe('addEntry', () => {
    it('adds entry to leaderboard', () => {
      const entry: LeaderboardEntry = {
        name: 'Merchant',
        credits: 75000,
        systemsVisited: 15,
        date: '2026-02-16',
      };
      const result = addEntry(entry);
      expect(result).toHaveLength(1);
      expect(result[0].credits).toBe(75000);
    });

    it('sorts entries by credits descending', () => {
      addEntry({ name: 'Poor', credits: 10000, systemsVisited: 5, date: '2026-02-16' });
      addEntry({ name: 'Rich', credits: 100000, systemsVisited: 20, date: '2026-02-16' });
      addEntry({ name: 'Medium', credits: 50000, systemsVisited: 10, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('Rich');
      expect(entries[1].name).toBe('Medium');
      expect(entries[2].name).toBe('Poor');
    });

    it('limits to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        addEntry({
          name: `Trader${i}`,
          credits: i * 10000,
          systemsVisited: i,
          date: '2026-02-16',
        });
      }
      expect(getLeaderboard()).toHaveLength(10);
    });

    it('keeps highest credits when trimming', () => {
      for (let i = 0; i < 15; i++) {
        addEntry({
          name: `Trader${i}`,
          credits: i * 10000,
          systemsVisited: i,
          date: '2026-02-16',
        });
      }
      const entries = getLeaderboard();
      expect(entries[0].credits).toBe(140000); // Trader14
      expect(entries[9].credits).toBe(50000);  // Trader5
    });
  });

  describe('getTop', () => {
    it('returns top N entries', () => {
      for (let i = 0; i < 5; i++) {
        addEntry({
          name: `Trader${i}`,
          credits: (i + 1) * 20000,
          systemsVisited: i + 1,
          date: '2026-02-16',
        });
      }
      const top3 = getTop(3);
      expect(top3).toHaveLength(3);
      expect(top3[0].credits).toBe(100000);
    });

    it('returns all entries if fewer than N', () => {
      addEntry({ name: 'Solo', credits: 50000, systemsVisited: 8, date: '2026-02-16' });
      expect(getTop(5)).toHaveLength(1);
    });
  });

  describe('wouldRank', () => {
    it('returns rank when board not full', () => {
      addEntry({ name: 'Test', credits: 50000, systemsVisited: 5, date: '2026-02-16' });
      expect(wouldRank(75000)).toBe(1);
      expect(wouldRank(25000)).toBe(2);
    });

    it('returns rank when would beat existing', () => {
      for (let i = 0; i < 10; i++) {
        addEntry({
          name: `Trader${i}`,
          credits: (i + 1) * 10000,
          systemsVisited: i,
          date: '2026-02-16',
        });
      }
      expect(wouldRank(150000)).toBe(1);
      expect(wouldRank(55000)).toBe(6); // slots between 60000 and 50000
    });

    it('returns null when would not rank', () => {
      for (let i = 0; i < 10; i++) {
        addEntry({
          name: `Trader${i}`,
          credits: (i + 1) * 10000,
          systemsVisited: i,
          date: '2026-02-16',
        });
      }
      expect(wouldRank(5000)).toBeNull();
    });
  });

  describe('getRank', () => {
    it('returns rank for existing credits', () => {
      addEntry({ name: 'First', credits: 100000, systemsVisited: 10, date: '2026-02-16' });
      addEntry({ name: 'Second', credits: 50000, systemsVisited: 5, date: '2026-02-16' });
      const entries = getLeaderboard();
      expect(entries).toHaveLength(2);
      expect(getRank(entries[0].credits)).toBe(1);
      expect(getRank(entries[1].credits)).toBe(2);
    });

    it('returns null for non-existent credits', () => {
      addEntry({ name: 'Test', credits: 50000, systemsVisited: 5, date: '2026-02-16' });
      expect(getRank(25000)).toBeNull();
    });
  });

  describe('clearLeaderboard', () => {
    it('removes all entries', () => {
      addEntry({ name: 'Test', credits: 50000, systemsVisited: 5, date: '2026-02-16' });
      clearLeaderboard();
      expect(getLeaderboard()).toEqual([]);
    });
  });
});
