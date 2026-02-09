import { useState, useEffect } from 'react';
import { GameState, CraftedItem } from '../types';
import { getTodayString, isNewDay } from '../utils/gameLogic';

const STORAGE_KEY = 'forge_game_state';
const DAILY_CRAFTS_LIMIT = 5;

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    inventory: [],
    lastPlayedDate: getTodayString(),
    dailyCraftsRemaining: DAILY_CRAFTS_LIMIT
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: GameState = JSON.parse(saved);
        
        // Check if it's a new day
        if (isNewDay(parsed.lastPlayedDate)) {
          setGameState({
            inventory: parsed.inventory,
            lastPlayedDate: getTodayString(),
            dailyCraftsRemaining: DAILY_CRAFTS_LIMIT
          });
        } else {
          setGameState(parsed);
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

  return {
    gameState,
    isLoaded,
    addItem,
    removeItem,
    resetDailyCrafts,
    canCraft: gameState.dailyCraftsRemaining > 0
  };
}
