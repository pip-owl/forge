import { useState, useEffect, useCallback } from 'react';
import { GameState, CraftedItem, Player, Enemy } from '../types';
import { getTodayString, isNewDay, createDailyDungeon, XP_TO_LEVEL, calculatePlayerDamage, calculateDamageReduction } from '../utils/gameLogic';

const STORAGE_KEY = 'forge_game_state';
const DAILY_CRAFTS_LIMIT = 5;

const DEFAULT_PLAYER: Player = {
  level: 1,
  xp: 0,
  maxHp: 100,
  currentHp: 100,
  equippedWeapon: null,
  equippedArmor: null,
  wins: 0,
  losses: 0
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    inventory: [],
    lastPlayedDate: getTodayString(),
    dailyCraftsRemaining: DAILY_CRAFTS_LIMIT,
    player: DEFAULT_PLAYER,
    dungeon: createDailyDungeon(getTodayString())
  }));
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: GameState = JSON.parse(saved);
        
        // Check if it's a new day
        if (isNewDay(parsed.lastPlayedDate)) {
          const today = getTodayString();
          setGameState({
            inventory: parsed.inventory,
            lastPlayedDate: today,
            dailyCraftsRemaining: DAILY_CRAFTS_LIMIT,
            player: parsed.player || DEFAULT_PLAYER,
            dungeon: createDailyDungeon(today)
          });
        } else {
          // Ensure dungeon resets if needed
          const needsDungeonReset = isNewDay(parsed.dungeon?.lastResetDate || parsed.lastPlayedDate);
          setGameState({
            ...parsed,
            player: parsed.player || DEFAULT_PLAYER,
            dungeon: needsDungeonReset ? createDailyDungeon(parsed.lastPlayedDate) : (parsed.dungeon || createDailyDungeon(parsed.lastPlayedDate))
          });
        }
      } catch (e) {
        console.error('Failed to parse game state:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

  const addItem = (item: CraftedItem) => {
    setGameState(prev => ({
      ...prev,
      inventory: [item, ...prev.inventory],
      dailyCraftsRemaining: Math.max(0, prev.dailyCraftsRemaining - 1)
    }));
  };

  const removeItem = (itemId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== itemId)
    }));
  };

  const resetDailyCrafts = () => {
    setGameState(prev => ({
      ...prev,
      lastPlayedDate: getTodayString(),
      dailyCraftsRemaining: DAILY_CRAFTS_LIMIT
    }));
  };

  // Combat functions
  const equipWeapon = useCallback((item: CraftedItem | null) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        equippedWeapon: item
      }
    }));
  }, []);

  const equipArmor = useCallback((item: CraftedItem | null) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        equippedArmor: item
      }
    }));
  }, []);

  const attackEnemy = useCallback((enemyId: string): { damage: number; enemyDefeated: boolean } => {
    const damage = calculatePlayerDamage(gameState.player);
    
    setGameState(prev => {
      const enemies = prev.dungeon.enemies.map(e => 
        e.id === enemyId 
          ? { ...e, currentHp: Math.max(0, e.currentHp - damage) }
          : e
      );
      
      const allDefeated = enemies.every(e => e.defeated || e.currentHp === 0);
      
      return {
        ...prev,
        dungeon: {
          ...prev.dungeon,
          enemies: enemies.map(e => e.id === enemyId && e.currentHp === 0 ? { ...e, defeated: true } : e),
          cleared: allDefeated
        }
      };
    });

    return { damage, enemyDefeated: false };
  }, [gameState.player]);

  const enemyAttack = useCallback((enemy: Enemy): { damage: number; playerDefeated: boolean } => {
    const damageReduction = calculateDamageReduction(gameState.player);
    const damage = Math.max(1, Math.floor(enemy.damage * (1 - damageReduction)));
    
    setGameState(prev => {
      const newHp = Math.max(0, prev.player.currentHp - damage);
      return {
        ...prev,
        player: {
          ...prev.player,
          currentHp: newHp
        }
      };
    });

    return { damage, playerDefeated: gameState.player.currentHp - damage <= 0 };
  }, [gameState.player]);

  const awardXp = useCallback((xp: number) => {
    setGameState(prev => {
      let newXp = prev.player.xp + xp;
      let newLevel = prev.player.level;
      let newMaxHp = prev.player.maxHp;
      
      // Check for level up
      while (newXp >= XP_TO_LEVEL * newLevel) {
        newXp -= XP_TO_LEVEL * newLevel;
        newLevel++;
        newMaxHp += 10;
      }
      
      return {
        ...prev,
        player: {
          ...prev.player,
          level: newLevel,
          xp: newXp,
          maxHp: newMaxHp,
          currentHp: prev.player.currentHp + (newLevel > prev.player.level ? 10 : 0)
        }
      };
    });
  }, []);

  const healPlayer = useCallback((amount?: number) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        currentHp: amount ? Math.min(prev.player.maxHp, prev.player.currentHp + amount) : prev.player.maxHp
      }
    }));
  }, []);

  const recordWin = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        wins: prev.player.wins + 1
      }
    }));
  }, []);

  const recordLoss = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        losses: prev.player.losses + 1
      }
    }));
  }, []);

  const nextEnemy = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      dungeon: {
        ...prev.dungeon,
        currentEnemyIndex: prev.dungeon.currentEnemyIndex + 1
      }
    }));
  }, []);

  const resetDungeon = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      dungeon: createDailyDungeon(getTodayString()),
      player: {
        ...prev.player,
        currentHp: prev.player.maxHp
      }
    }));
  }, []);

  const rest = useCallback((): { success: boolean; message: string } => {
    if (gameState.dungeon.hasRested) {
      return { success: false, message: 'You have already rested this dungeon!' };
    }

    setGameState(prev => ({
      ...prev,
      dungeon: {
        ...prev.dungeon,
        hasRested: true
      },
      player: {
        ...prev.player,
        currentHp: prev.player.maxHp
      }
    }));

    return { success: true, message: 'You rest and recover your strength...' };
  }, [gameState.dungeon.hasRested]);

  const getCurrentEnemy = useCallback(() => {
    return gameState.dungeon.enemies[gameState.dungeon.currentEnemyIndex];
  }, [gameState.dungeon]);

  return {
    gameState,
    isLoaded,
    addItem,
    removeItem,
    resetDailyCrafts,
    canCraft: gameState.dailyCraftsRemaining > 0,
    hasRested: gameState.dungeon.hasRested,
    // Combat
    equipWeapon,
    equipArmor,
    attackEnemy,
    enemyAttack,
    awardXp,
    healPlayer,
    rest,
    recordWin,
    recordLoss,
    nextEnemy,
    resetDungeon,
    getCurrentEnemy
  };
}
