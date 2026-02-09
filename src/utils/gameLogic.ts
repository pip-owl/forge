import { Material, ItemType, Rarity, CraftedItem, ITEM_ICONS, Enemy, DungeonState, Player } from '../types';

// Available materials in the game
export const MATERIALS: Material[] = [
  { id: 'iron', name: 'Iron Ore', type: 'ore', icon: '⛏️', color: '#71717a', description: 'Basic sturdy metal' },
  { id: 'gold', name: 'Gold Ore', type: 'ore', icon: '✨', color: '#fbbf24', description: 'Precious and malleable' },
  { id: 'mithril', name: 'Mithril', type: 'ore', icon: '💎', color: '#60a5fa', description: 'Light yet stronger than steel' },
  { id: 'ruby', name: 'Ruby', type: 'gem', icon: '🔴', color: '#ef4444', description: 'Gem of fiery power' },
  { id: 'sapphire', name: 'Sapphire', type: 'gem', icon: '🔵', color: '#3b82f6', description: 'Gem of icy wisdom' },
  { id: 'emerald', name: 'Emerald', type: 'gem', icon: '🟢', color: '#22c55e', description: 'Gem of natural vitality' },
  { id: 'fire', name: 'Fire Essence', type: 'essence', icon: '🔥', color: '#f97316', description: 'Pure elemental fire' },
  { id: 'shadow', name: 'Shadow Essence', type: 'essence', icon: '🌑', color: '#6b7280', description: 'Dark mysterious energy' },
  { id: 'light', name: 'Light Essence', type: 'essence', icon: '☀️', color: '#facc15', description: 'Radiant holy power' },
];

// Item types that can be crafted
const ITEM_TYPES: ItemType[] = ['sword', 'axe', 'armor', 'ring', 'helmet', 'boots', 'gauntlets', 'shield'];

// Prefixes based on materials
const PREFIXES: Record<string, string[]> = {
  iron: ['Iron', 'Sturdy', 'Heavy'],
  gold: ['Golden', 'Gilded', 'Shining'],
  mithril: ['Mithril', 'Elven', 'Ethereal'],
  ruby: ['Ruby', 'Fiery', 'Crimson'],
  sapphire: ['Sapphire', 'Icy', 'Azure'],
  emerald: ['Emerald', 'Verdant', 'Jade'],
  fire: ['Flaming', 'Blazing', 'Infernal'],
  shadow: ['Shadow', 'Dark', 'Night'],
  light: ['Radiant', 'Holy', 'Bright']
};

// Suffixes based on combinations
const SUFFIXES = [
  'of Power', 'of Might', 'of the Forge', 'of Legends', 
  'of Eternity', 'of Shadows', 'of Light', 'of Flames',
  'of Frost', 'of Nature', 'of Valor', 'of Wisdom'
];

// Simple hash function for deterministic randomness
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Seeded random number generator
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Determine rarity based on probability
function determineRarity(seed: number): Rarity {
  const rand = seededRandom(seed);
  if (rand < 0.01) return 'legendary';
  if (rand < 0.05) return 'epic';
  if (rand < 0.15) return 'rare';
  if (rand < 0.40) return 'uncommon';
  return 'common';
}

// Determine item type based on materials and seed
function determineItemType(materials: Material[], seed: number): ItemType {
  const materialIds = materials.map(m => m.id).sort().join('');
  const typeSeed = hashString(materialIds + seed);
  const index = Math.floor(seededRandom(typeSeed) * ITEM_TYPES.length);
  return ITEM_TYPES[index];
}

// Generate item name
function generateItemName(itemType: ItemType, materials: Material[], seed: number): string {
  const primaryMaterial = materials[Math.floor(seededRandom(seed) * materials.length)];
  const prefixes = PREFIXES[primaryMaterial.id] || ['Mysterious'];
  const prefix = prefixes[Math.floor(seededRandom(seed + 1) * prefixes.length)];
  const suffix = SUFFIXES[Math.floor(seededRandom(seed + 2) * SUFFIXES.length)];
  
  const typeName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
  
  // 30% chance to include suffix for rare+ items
  const rarity = determineRarity(seed);
  if ((rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') && seededRandom(seed + 3) > 0.7) {
    return `${prefix} ${typeName} ${suffix}`;
  }
  return `${prefix} ${typeName}`;
}

// Generate stats based on rarity and materials
function generateStats(itemType: ItemType, rarity: Rarity, materials: Material[], seed: number): { damage?: number; defense?: number; speed?: number; magic?: number } {
  const multiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2.2,
    epic: 3.5,
    legendary: 5
  }[rarity];

  const stats: { damage?: number; defense?: number; speed?: number; magic?: number } = {};
  
  // Base stats based on item type
  if (itemType === 'sword' || itemType === 'axe') {
    stats.damage = Math.floor((10 + seededRandom(seed) * 20) * multiplier);
    stats.speed = Math.floor((5 + seededRandom(seed + 1) * 10) * multiplier);
  } else if (itemType === 'armor' || itemType === 'helmet' || itemType === 'boots' || itemType === 'gauntlets' || itemType === 'shield') {
    stats.defense = Math.floor((8 + seededRandom(seed) * 15) * multiplier);
    if (itemType === 'boots') stats.speed = Math.floor((3 + seededRandom(seed + 1) * 8) * multiplier);
  } else if (itemType === 'ring') {
    stats.magic = Math.floor((5 + seededRandom(seed) * 15) * multiplier);
    stats.speed = Math.floor((2 + seededRandom(seed + 1) * 5) * multiplier);
  }

  // Material bonuses
  materials.forEach((mat, idx) => {
    if (mat.id === 'ruby' || mat.id === 'fire') {
      stats.damage = (stats.damage || 0) + Math.floor(3 * multiplier * (idx + 1));
    }
    if (mat.id === 'sapphire' || mat.id === 'shadow') {
      stats.magic = (stats.magic || 0) + Math.floor(4 * multiplier * (idx + 1));
    }
    if (mat.id === 'emerald' || mat.id === 'light') {
      stats.defense = (stats.defense || 0) + Math.floor(2 * multiplier * (idx + 1));
    }
    if (mat.id === 'mithril') {
      stats.speed = (stats.speed || 0) + Math.floor(3 * multiplier * (idx + 1));
    }
  });

  return stats;
}

// Main crafting function
export function craftItem(selectedMaterials: Material[], date: Date = new Date()): CraftedItem {
  const dateStr = date.toISOString().split('T')[0];
  const materialIds = selectedMaterials.map(m => m.id).sort().join('-');
  const seed = hashString(`${materialIds}-${dateStr}`);
  
  const itemType = determineItemType(selectedMaterials, seed);
  const rarity = determineRarity(seed);
  const name = generateItemName(itemType, selectedMaterials, seed);
  const stats = generateStats(itemType, rarity, selectedMaterials, seed);
  
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type: itemType,
    rarity,
    stats,
    materials: selectedMaterials.map(m => m.id),
    craftedAt: dateStr,
    icon: ITEM_ICONS[itemType]
  };
}

// Check if it's a new day
export function isNewDay(lastPlayed: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return lastPlayed !== today;
}

// Get today's date string
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Combat Constants
export const XP_TO_LEVEL = 100;

// Create daily dungeon enemies
export function createDailyDungeon(dateStr: string): DungeonState {
  const seed = hashString(dateStr + '-dungeon');
  
  const enemies: Enemy[] = [
    {
      id: 'enemy-1',
      name: 'Goblin Scout',
      type: 'goblin',
      maxHp: 40 + Math.floor(seededRandom(seed) * 20),
      currentHp: 40 + Math.floor(seededRandom(seed) * 20),
      damage: 8 + Math.floor(seededRandom(seed + 1) * 5),
      icon: '👺',
      xpReward: 25,
      defeated: false
    },
    {
      id: 'enemy-2',
      name: 'Orc Warrior',
      type: 'orc',
      maxHp: 80 + Math.floor(seededRandom(seed + 2) * 30),
      currentHp: 80 + Math.floor(seededRandom(seed + 2) * 30),
      damage: 15 + Math.floor(seededRandom(seed + 3) * 8),
      icon: '👹',
      xpReward: 50,
      defeated: false
    },
    {
      id: 'enemy-3',
      name: 'Ancient Dragon',
      type: 'dragon',
      maxHp: 150 + Math.floor(seededRandom(seed + 4) * 50),
      currentHp: 150 + Math.floor(seededRandom(seed + 4) * 50),
      damage: 25 + Math.floor(seededRandom(seed + 5) * 15),
      icon: '🐉',
      xpReward: 100,
      defeated: false
    }
  ];
  
  return {
    enemies,
    currentEnemyIndex: 0,
    cleared: false,
    lastResetDate: dateStr,
    hasRested: false
  };
}

// Calculate player's attack damage
export function calculatePlayerDamage(player: Player): number {
  const baseDamage = 5 + player.level * 2;
  const weaponDamage = player.equippedWeapon?.stats.damage || 0;
  const magicBonus = Math.floor((player.equippedWeapon?.stats.magic || 0) * 0.5);
  
  // Add some variance
  const variance = 0.8 + Math.random() * 0.4;
  return Math.floor((baseDamage + weaponDamage + magicBonus) * variance);
}

// Calculate damage reduction from armor
export function calculateDamageReduction(player: Player): number {
  const baseReduction = 0;
  const armorDefense = player.equippedArmor?.stats.defense || 0;
  const magicDefense = Math.floor((player.equippedArmor?.stats.magic || 0) * 0.3);
  
  // Cap at 75% damage reduction
  return Math.min(0.75, (baseReduction + armorDefense + magicDefense) / 100);
}

// Get XP needed for next level
export function getXpForNextLevel(level: number): number {
  return XP_TO_LEVEL * level;
}
