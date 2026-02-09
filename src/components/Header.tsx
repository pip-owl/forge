interface HeaderProps {
  bonusForges: number;
  totalForgesAvailable: number;
  inventoryCount: number;
  onOpenInventory: () => void;
  onOpenForge: () => void;
  onOpenBattle: () => void;
  activeTab: 'forge' | 'battle' | 'inventory';
  playerLevel: number;
}

export function Header({ 
  bonusForges,
  totalForgesAvailable,
  inventoryCount, 
  onOpenInventory, 
  onOpenForge,
  onOpenBattle,
  activeTab,
  playerLevel
}: HeaderProps) {
  return (
    <header className="game-header">
      <div className="header-left">
        <h1 className="game-title">
          <span className="title-icon">🔥</span>
          FORGE
        </h1>
        <p className="game-subtitle">Master Blacksmith</p>
      </div>

      <nav className="header-nav">
        <button 
          className={`nav-tab ${activeTab === 'forge' ? 'active' : ''}`}
          onClick={onOpenForge}
        >
          🔨 Forge
        </button>
        <button 
          className={`nav-tab ${activeTab === 'battle' ? 'active' : ''}`}
          onClick={onOpenBattle}
        >
          ⚔️ Battle
        </button>
        <button 
          className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={onOpenInventory}
        >
          🎒 Inventory
        </button>
      </nav>

      <div className="header-stats">
        <div className="stat-badge">
          <span className="stat-icon">⚡</span>
          <div className="stat-info">
            <span className="stat-label">Daily Crafts</span>
            <span className={`stat-value ${totalForgesAvailable === 0 ? 'empty' : ''}`}>
              {totalForgesAvailable}
              {bonusForges > 0 && <span className="bonus-indicator"> (+{bonusForges})</span>}
            </span>
          </div>
        </div>

        <div className="stat-badge">
          <span className="stat-icon">⭐</span>
          <div className="stat-info">
            <span className="stat-label">Level</span>
            <span className="stat-value">{playerLevel}</span>
          </div>
        </div>

        <div className="stat-badge inventory-stat">
          <span className="stat-icon">🎒</span>
          <div className="stat-info">
            <span className="stat-label">Items</span>
            <span className="stat-value">{inventoryCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
