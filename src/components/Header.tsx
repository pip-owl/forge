interface HeaderProps {
  dailyCraftsRemaining: number;
  inventoryCount: number;
  onOpenInventory: () => void;
}

export function Header({ dailyCraftsRemaining, inventoryCount, onOpenInventory }: HeaderProps) {
  return (
    <header className="game-header">
      <div className="header-left">
        <h1 className="game-title">
          <span className="title-icon">🔥</span>
          FORGE
        </h1>
        <p className="game-subtitle">Master Blacksmith</p>
      </div>

      <div className="header-stats">
        <div className="stat-badge">
          <span className="stat-icon">⚡</span>
          <div className="stat-info">
            <span className="stat-label">Daily Crafts</span>
            <span className={`stat-value ${dailyCraftsRemaining === 0 ? 'empty' : ''}`}>
              {dailyCraftsRemaining}
            </span>
          </div>
        </div>

        <button className="stat-badge inventory-btn" onClick={onOpenInventory}>
          <span className="stat-icon">🎒</span>
          <div className="stat-info">
            <span className="stat-label">Inventory</span>
            <span className="stat-value">{inventoryCount}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
