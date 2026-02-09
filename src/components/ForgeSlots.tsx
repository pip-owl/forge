import { Material } from '../types';

interface ForgeSlotsProps {
  selectedMaterials: Material[];
  onRemove: (index: number) => void;
  onCraft: () => void;
  canCraft: boolean;
  isCrafting: boolean;
}

export function ForgeSlots({ selectedMaterials, onRemove, onCraft, canCraft, isCrafting }: ForgeSlotsProps) {
  const slots = [0, 1, 2];

  return (
    <div className="forge-container">
      <h3 className="section-title">🔥 The Forge</h3>
      
      <div className="forge-slots">
        {slots.map(slotIndex => {
          const material = selectedMaterials[slotIndex];
          return (
            <div 
              key={slotIndex} 
              className={`forge-slot ${material ? 'filled' : 'empty'} ${isCrafting ? 'crafting' : ''}`}
              onClick={() => material && onRemove(slotIndex)}
            >
              {material ? (
                <>
                  <span className="slot-icon" style={{ color: material.color }}>{material.icon}</span>
                  <span className="slot-name">{material.name}</span>
                  <span className="slot-hint">Click to remove</span>
                </>
              ) : (
                <>
                  <span className="slot-placeholder">+</span>
                  <span className="slot-hint">Select a material</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        className={`craft-button ${isCrafting ? 'crafting' : ''} ${!canCraft ? 'disabled' : ''}`}
        onClick={onCraft}
        disabled={!canCraft || isCrafting}
      >
        {isCrafting ? (
          <>
            <span className="spinner">⚡</span>
            Forging...
          </>
        ) : (
          <>🔨 Forge Item</>
        )}
      </button>

      <p className="forge-hint">
        Select 3 materials to forge an item. Different combinations create different results!
      </p>
    </div>
  );
}
