/**
 * Achievement system for Frontier (Elite/space trading)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
}

export interface AchievementProgress { unlockedAt: number; }
export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first_trade', name: 'Trader', description: 'Complete your first trade', icon: '💰', category: 'skill' },
  { id: 'first_jump', name: 'Explorer', description: 'Jump to another system', icon: '🚀', category: 'skill' },
  { id: 'first_combat', name: 'Fighter', description: 'Win your first combat', icon: '⚔️', category: 'skill' },
  { id: 'profit_1000', name: 'Profitable', description: 'Make 1,000 credits profit', icon: '📈', category: 'skill' },
  { id: 'dock_perfect', name: 'Smooth Landing', description: 'Dock without bumping', icon: '🎯', category: 'skill' },
  { id: 'escape_pirate', name: 'Narrow Escape', description: 'Escape from pirates', icon: '😰', category: 'skill' },

  // Exploration
  { id: 'systems_5', name: 'Tourist', description: 'Visit 5 systems', icon: '🗺️', category: 'exploration' },
  { id: 'systems_10', name: 'Wanderer', description: 'Visit 10 systems', icon: '🌌', category: 'exploration' },
  { id: 'rare_goods', name: 'Contraband', description: 'Trade illegal goods', icon: '🔒', category: 'exploration' },

  // Mastery
  { id: 'wealth_10000', name: 'Rich', description: 'Accumulate 10,000 credits', icon: '💎', category: 'mastery' },
  { id: 'wealth_100000', name: 'Wealthy', description: 'Accumulate 100,000 credits', icon: '👑', category: 'mastery' },
  { id: 'elite', name: 'Elite', description: 'Reach Elite combat rank', icon: '🏆', category: 'mastery' },
  { id: 'ship_upgrade', name: 'Upgraded', description: 'Buy a ship upgrade', icon: '🔧', category: 'mastery' },
  { id: 'new_ship', name: 'Fleet Owner', description: 'Buy a new ship', icon: '🚀', category: 'mastery' },
  { id: 'missions_10', name: 'Mercenary', description: 'Complete 10 missions', icon: '📜', category: 'mastery' },

  // Daily
  { id: 'daily_complete', name: 'Daily Trader', description: 'Complete a daily run', icon: '📅', category: 'daily' },
  { id: 'daily_top_10', name: 'Daily Contender', description: 'Top 10 in daily', icon: '🔟', category: 'daily' },
  { id: 'daily_top_3', name: 'Daily Champion', description: 'Top 3 in daily', icon: '🥉', category: 'daily' },
  { id: 'daily_first', name: 'Daily Legend', description: 'First place in daily', icon: '🥇', category: 'daily' },
  { id: 'daily_streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥', category: 'daily' },
  { id: 'daily_streak_7', name: 'Dedicated', description: '7-day streak', icon: '💪', category: 'daily' },
];

const STORAGE_KEY = 'frontier_achievements';
const STREAK_KEY = 'frontier_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };

  constructor() { this.store = this.load(); this.dailyStreak = this.loadStreak(); }

  private load(): AchievementStore { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
  private save(): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); } catch {} }
  private loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"lastDate":"","count":0}'); } catch { return { lastDate: '', count: 0 }; } }
  private saveStreak(): void { try { localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak)); } catch {} }

  isUnlocked(id: string): boolean { return id in this.store; }
  getProgress(): AchievementStore { return { ...this.store }; }
  getUnlockedCount(): number { return Object.keys(this.store).length; }
  getTotalCount(): number { return ACHIEVEMENTS.length; }
  getAchievement(id: string) { return ACHIEVEMENTS.find((a) => a.id === id); }
  getAllAchievements() { return ACHIEVEMENTS; }

  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const a = this.getAchievement(id); if (!a) return null;
    this.store[id] = { unlockedAt: Date.now() }; this.save(); return a;
  }

  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }

  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    let a = this.unlock('daily_complete'); if (a) unlocked.push(a);
    if (rank <= 10) { a = this.unlock('daily_top_10'); if (a) unlocked.push(a); }
    if (rank <= 3) { a = this.unlock('daily_top_3'); if (a) unlocked.push(a); }
    if (rank === 1) { a = this.unlock('daily_first'); if (a) unlocked.push(a); }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.dailyStreak.lastDate === yesterday) this.dailyStreak.count++;
    else if (this.dailyStreak.lastDate !== today) this.dailyStreak.count = 1;
    this.dailyStreak.lastDate = today; this.saveStreak();
    if (this.dailyStreak.count >= 3) { a = this.unlock('daily_streak_3'); if (a) unlocked.push(a); }
    if (this.dailyStreak.count >= 7) { a = this.unlock('daily_streak_7'); if (a) unlocked.push(a); }
    return unlocked;
  }

  reset(): void { this.store = {}; this.dailyStreak = { lastDate: '', count: 0 }; this.save(); this.saveStreak(); }
}

let instance: AchievementManager | null = null;
export function getAchievementManager(): AchievementManager { if (!instance) instance = new AchievementManager(); return instance; }
