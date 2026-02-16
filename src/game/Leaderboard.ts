// Leaderboard for Frontier - tracks wealthy traders

const STORAGE_KEY = 'frontier-leaderboard';
const MAX_ENTRIES = 10;

export interface LeaderboardEntry {
  name: string;
  credits: number;
  systemsVisited: number;
  date: string;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable
  }
}

export function addEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const entries = getLeaderboard();
  entries.push(entry);
  
  // Sort by credits (descending)
  entries.sort((a, b) => b.credits - a.credits);
  
  // Keep top N
  const trimmed = entries.slice(0, MAX_ENTRIES);
  saveLeaderboard(trimmed);
  return trimmed;
}

export function getTop(n: number = MAX_ENTRIES): LeaderboardEntry[] {
  return getLeaderboard().slice(0, n);
}

export function wouldRank(credits: number): number | null {
  const entries = getLeaderboard();
  if (entries.length < MAX_ENTRIES) {
    // Find where it would slot in
    const position = entries.findIndex(e => credits > e.credits);
    return position === -1 ? entries.length + 1 : position + 1;
  }
  
  // Check if beats any existing entry
  const position = entries.findIndex(e => credits > e.credits);
  if (position === -1) return null;
  return position + 1;
}

export function getRank(credits: number): number | null {
  const entries = getLeaderboard();
  const position = entries.findIndex(e => e.credits === credits);
  return position === -1 ? null : position + 1;
}

export function clearLeaderboard(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
