import { useState, useCallback } from 'react';
import { Material, CraftedItem } from './types';
import { MATERIALS, craftItem } from './utils/gameLogic';
import { useGameState } from './hooks/useGameState';
import { Header } from './components/Header';
import { MaterialGrid } from './components/MaterialGrid';
import { ForgeSlots } from './components/ForgeSlots';
import { CraftingResult } from './components/CraftingResult';
import { Inventory } from './components/Inventory';
import './styles.css';

function App() {
  const { gameState, isLoaded, addItem, removeItem, canCraft } = useGameState();
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [craftedItem, setCraftedItem] = useState<CraftedItem | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

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
        dailyCraftsRemaining={gameState.dailyCraftsRemaining}
        inventoryCount={gameState.inventory.length}
        onOpenInventory={() => setShowInventory(true)}
      />

      <main className="game-container">
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
        />
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

      <footer className="game-footer">
        <p>New crafts available daily. Different combinations yield different results! 🎮</p>
      </footer>
    </div>
  );
}

export default App;
