// Types for the FORGE game

export type MaterialType = 'ore' | 'gem' | 'essence';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  icon: string;
  color: string;
  description: string;
}

export type ItemType = 'sword' | 'axe' | 'armor' | 'ring' | 'helmet' | 'boots' | 'gauntlets' | 'shield';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemStats {
  damage?: number;
  defense?: number;
  speed?: number;
  magic?: number;
}

export interface CraftedItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  stats: ItemStats;
  materials: string[];
  craftedAt: string;
  icon: string;
}

// Combat Types
export interface Player {
  level: number;
  xp: number;
  maxHp: number;
  currentHp: number;
  equippedWeapon: CraftedItem | null;
  equippedArmor: CraftedItem | null;
  wins: number;
  losses: number;
}

export type EnemyType = 'goblin' | 'orc' | 'dragon';

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  maxHp: number;
  currentHp: number;
  damage: number;
  icon: string;
  xpReward: number;
  defeated: boolean;
}

export interface DungeonState {
  enemies: Enemy[];
  currentEnemyIndex: number;
  cleared: boolean;
  lastResetDate: string;
  hasRested: boolean;
}

export interface CombatLog {
  id: string;
  message: string;
  type: 'player' | 'enemy' | 'system' | 'reward';
  damage?: number;
}

export interface GameState {
  inventory: CraftedItem[];
  lastPlayedDate: string;
  dailyCraftsRemaining: number;
  bonusForges: number;
  player: Player;
  dungeon: DungeonState;
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

export const RARITY_NAMES: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
};

export const ITEM_ICONS: Record<ItemType, string> = {
  sword: '⚔️',
  axe: '🪓',
  armor: '🛡️',
  ring: '💍',
  helmet: '🪖',
  boots: '🥾',
  gauntlets: '🧤',
  shield: '🛡️'
};
