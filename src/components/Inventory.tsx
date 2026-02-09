import { CraftedItem, RARITY_COLORS, RARITY_NAMES } from '../types';

interface InventoryProps {
  items: CraftedItem[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (itemId: string) => void;
}

export function Inventory({ items, isOpen, onClose, onDelete }: InventoryProps) {
  if (!isOpen) return null;

  const sortedItems = [...items].sort((a, b) => {
    const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal inventory-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎒 Your Inventory</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="inventory-content">
          {sortedItems.length === 0 ? (
            <div className="empty-inventory">
              <p>Your inventory is empty.</p>
              <p>Craft some items at the forge!</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {sortedItems.map(item => (
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
                    onClick={() => onDelete(item.id)}
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
  );
}
