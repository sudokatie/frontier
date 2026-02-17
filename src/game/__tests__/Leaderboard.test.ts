/**
 * @jest-environment jsdom
 */

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard
} from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no entries', () => {
    expect(getLeaderboard()).toEqual([]);
  });

  it('should add an entry', () => {
    const entry = {
      name: 'Trader',
      credits: 50000,
      systemsVisited: 12,
      date: new Date().toISOString()
    };
    const entries = addEntry(entry);
    expect(entries[0].credits).toBe(50000);
  });

  it('should sort by credits descending', () => {
    addEntry({ name: 'Low', credits: 10000, systemsVisited: 3, date: '2026-01-01' });
    addEntry({ name: 'High', credits: 100000, systemsVisited: 20, date: '2026-01-02' });
    addEntry({ name: 'Mid', credits: 50000, systemsVisited: 10, date: '2026-01-03' });

    const top = getTop();
    expect(top[0].name).toBe('High');
    expect(top[1].name).toBe('Mid');
    expect(top[2].name).toBe('Low');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      addEntry({ name: `T${i}`, credits: i * 5000, systemsVisited: i, date: '2026-01-01' });
    }
    expect(getTop().length).toBe(10);
  });

  it('should persist to localStorage', () => {
    addEntry({ name: 'Saved', credits: 75000, systemsVisited: 15, date: '2026-01-01' });
    const stored = JSON.parse(localStorage.getItem('frontier-leaderboard')!);
    expect(stored[0].name).toBe('Saved');
  });

  it('should check if credits would rank', () => {
    addEntry({ name: 'First', credits: 80000, systemsVisited: 18, date: '2026-01-01' });
    expect(wouldRank(90000)).toBe(1);
    expect(wouldRank(50000)).toBe(2);
  });

  it('should get rank by credits', () => {
    addEntry({ name: 'First', credits: 80000, systemsVisited: 18, date: '2026-01-01' });
    addEntry({ name: 'Second', credits: 60000, systemsVisited: 12, date: '2026-01-02' });
    expect(getRank(80000)).toBe(1);
    expect(getRank(60000)).toBe(2);
    expect(getRank(99999)).toBeNull();
  });

  it('should clear all data', () => {
    addEntry({ name: 'Gone', credits: 25000, systemsVisited: 5, date: '2026-01-01' });
    clearLeaderboard();
    expect(getLeaderboard().length).toBe(0);
  });

  it('should track systems visited', () => {
    addEntry({ name: 'Explorer', credits: 45000, systemsVisited: 25, date: '2026-01-01' });
    const entry = getTop()[0];
    expect(entry.systemsVisited).toBe(25);
  });
});
