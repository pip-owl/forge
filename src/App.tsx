import { useState, useCallback } from 'react';
import { Material, CraftedItem, RARITY_COLORS, RARITY_NAMES } from './types';
import { MATERIALS, craftItem } from './utils/gameLogic';
import { useGameState } from './hooks/useGameState';
import { Header } from './components/Header';
import { MaterialGrid } from './components/MaterialGrid';
import { ForgeSlots } from './components/ForgeSlots';
import { CraftingResult } from './components/CraftingResult';
import { Inventory } from './components/Inventory';
import { Battle } from './components/Battle';
import './styles.css';

type TabType = 'forge' | 'battle' | 'inventory';

function App() {
  const { 
    gameState, 
    isLoaded, 
    addItem, 
    removeItem, 
    canCraft,
    totalForgesAvailable,
    hasRested,
    equipWeapon,
    equipArmor,
    attackEnemy,
    enemyAttack,
    awardXp,
    rest,
    awardBonusForges,
    recordWin,
    recordLoss,
    nextEnemy,
    resetDungeon,
    getCurrentEnemy
  } = useGameState();
  
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [craftedItem, setCraftedItem] = useState<CraftedItem | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('forge');

  const handleSelectMaterial = useCallback((material: Material) => {
    setSelectedMaterials(prev => {
      // If already selected, remove it
      const existingIndex = prev.findIndex(m => m.id === material.id);
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      }
      // If not selected and we have room, add it
      if (prev.length < 3) {
        return [...prev, material];
      }
      return prev;
    });
  }, []);

  const handleRemoveMaterial = useCallback((index: number) => {
    setSelectedMaterials(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCraft = useCallback(() => {
    if (selectedMaterials.length !== 3 || !canCraft) return;

    setIsCrafting(true);

    // Simulate crafting animation time
    setTimeout(() => {
      const item = craftItem(selectedMaterials);
      setCraftedItem(item);
      setIsCrafting(false);
    }, 1500);
  }, [selectedMaterials, canCraft]);

  const handleAddToInventory = useCallback(() => {
    if (craftedItem) {
      addItem(craftedItem);
      setCraftedItem(null);
      setSelectedMaterials([]);
    }
  }, [craftedItem, addItem]);

  const handleCloseResult = useCallback(() => {
    setCraftedItem(null);
  }, []);

  const currentEnemy = getCurrentEnemy();

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-forge">🔥</div>
        <p>Heating up the forge...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        bonusForges={gameState.bonusForges}
        totalForgesAvailable={totalForgesAvailable}
        inventoryCount={gameState.inventory.length}
        onOpenInventory={() => setActiveTab('inventory')}
        onOpenForge={() => setActiveTab('forge')}
        onOpenBattle={() => setActiveTab('battle')}
        activeTab={activeTab}
        playerLevel={gameState.player.level}
      />

      <main className="game-container">
        {activeTab === 'forge' && (
          <>
            <MaterialGrid
              materials={MATERIALS}
              selectedMaterials={selectedMaterials}
              onSelect={handleSelectMaterial}
              disabled={!canCraft || isCrafting}
            />

            <ForgeSlots
              selectedMaterials={selectedMaterials}
              onRemove={handleRemoveMaterial}
              onCraft={handleCraft}
              canCraft={canCraft && selectedMaterials.length === 3 && !isCrafting}
              isCrafting={isCrafting}
              dailyCraftsRemaining={gameState.dailyCraftsRemaining}
              bonusForges={gameState.bonusForges}
              totalForgesAvailable={totalForgesAvailable}
            />
          </>
        )}

        {activeTab === 'battle' && (
          <div className="battle-tab">
            <Battle
              player={gameState.player}
              currentEnemy={currentEnemy}
              currentEnemyIndex={gameState.dungeon.currentEnemyIndex}
              inventory={gameState.inventory}
              hasRested={hasRested}
              onEquipWeapon={equipWeapon}
              onEquipArmor={equipArmor}
              onAttack={attackEnemy}
              onEnemyAttack={enemyAttack}
              onAwardXp={awardXp}
              onRest={rest}
              onAwardBonusForges={awardBonusForges}
              onRecordWin={recordWin}
              onRecordLoss={recordLoss}
              onNextEnemy={nextEnemy}
              onResetDungeon={resetDungeon}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-tab">
            <div className="inventory-view">
              <div className="modal-header">
                <h2>🎒 Your Inventory</h2>
              </div>

              <div className="inventory-content">
                {gameState.inventory.length === 0 ? (
                  <div className="empty-inventory">
                    <p>Your inventory is empty.</p>
                    <p>Craft some items at the forge!</p>
                  </div>
                ) : (
                  <div className="inventory-grid">
                    {[...gameState.inventory]
                      .sort((a, b) => {
                        const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
                        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                      })
                      .map(item => (
                        <div key={item.id} className="inventory-item">
                          <div 
                            className="item-glow" 
                            style={{ 
                              backgroundColor: RARITY_COLORS[item.rarity],
                              boxShadow: `0 0 20px ${RARITY_COLORS[item.rarity]}40`
                            }}
                          />
                          <div className="item-header">
                            <span className="item-icon">{item.icon}</span>
                            <span 
                              className="item-rarity-badge"
                              style={{ backgroundColor: RARITY_COLORS[item.rarity] }}
                            >
                              {RARITY_NAMES[item.rarity]}
                            </span>
                          </div>

                          <h4 className="item-name" style={{ color: RARITY_COLORS[item.rarity] }}>
                            {item.name}
                          </h4>

                          <div className="item-stats-compact">
                            {item.stats.damage && <span>⚔️ {item.stats.damage}</span>}
                            {item.stats.defense && <span>🛡️ {item.stats.defense}</span>}
                            {item.stats.speed && <span>💨 {item.stats.speed}</span>}
                            {item.stats.magic && <span>✨ {item.stats.magic}</span>}
                          </div>

                          <div className="item-date">
                            Crafted: {item.craftedAt}
                          </div>

                          <button 
                            className="delete-btn"
                            onClick={() => removeItem(item.id)}
                            title="Delete item"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <CraftingResult
        item={craftedItem}
        onClose={handleCloseResult}
        onAddToInventory={handleAddToInventory}
      />

      <Inventory
        items={gameState.inventory}
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        onDelete={removeItem}
      />
    </div>
  );
}

export default App;
