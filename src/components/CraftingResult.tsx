import { CraftedItem, RARITY_COLORS, RARITY_NAMES } from '../types';

interface CraftingResultProps {
  item: CraftedItem | null;
  onClose: () => void;
  onAddToInventory: () => void;
}

export function CraftingResult({ item, onClose, onAddToInventory }: CraftingResultProps) {
  if (!item) return null;

  const rarityColor = RARITY_COLORS[item.rarity];
  const rarityName = RARITY_NAMES[item.rarity];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal crafting-result" onClick={e => e.stopPropagation()}>
        <div className="result-header" style={{ backgroundColor: rarityColor }}>
          <span className="result-icon">{item.icon}</span>
          <span className="result-rarity">{rarityName}</span>
        </div>

        <div className="result-content">
          <h2 className="result-name" style={{ color: rarityColor }}>{item.name}</h2>
          
          <div className="result-stats">
            {item.stats.damage && (
              <div className="stat">
                <span className="stat-label">⚔️ Damage</span>
                <span className="stat-value">{item.stats.damage}</span>
              </div>
            )}
            {item.stats.defense && (
              <div className="stat">
                <span className="stat-label">🛡️ Defense</span>
                <span className="stat-value">{item.stats.defense}</span>
              </div>
            )}
            {item.stats.speed && (
              <div className="stat">
                <span className="stat-label">💨 Speed</span>
                <span className="stat-value">{item.stats.speed}</span>
              </div>
            )}
            {item.stats.magic && (
              <div className="stat">
                <span className="stat-label">✨ Magic</span>
                <span className="stat-value">{item.stats.magic}</span>
              </div>
            )}
          </div>

          <div className="result-materials">
            <p>Crafted with:</p>
            <div className="material-tags">
              {item.materials.map((matId, idx) => (
                <span key={idx} className="material-tag">{matId}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Discard</button>
          <button className="btn-primary" onClick={onAddToInventory}>Add to Inventory</button>
        </div>
      </div>
    </div>
  );
}
