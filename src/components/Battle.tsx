import { useState, useCallback } from 'react';
import { Player, Enemy, CraftedItem, CombatLog, RARITY_COLORS } from '../types';
import { getXpForNextLevel } from '../utils/gameLogic';
import './Battle.css';

interface BattleProps {
  player: Player;
  currentEnemy: Enemy | null;
  currentEnemyIndex: number;
  inventory: CraftedItem[];
  hasRested: boolean;
  onEquipWeapon: (item: CraftedItem | null) => void;
  onEquipArmor: (item: CraftedItem | null) => void;
  onAttack: (enemyId: string) => { damage: number; enemyDefeated: boolean };
  onEnemyAttack: (enemy: Enemy) => { damage: number; playerDefeated: boolean };
  onAwardXp: (xp: number) => void;
  onRest: () => { success: boolean; message: string };
  onRecordWin: () => void;
  onRecordLoss: () => void;
  onNextEnemy: () => void;
  onResetDungeon: () => void;
  canGetBonusMaterial: boolean;
}

export function Battle({
  player,
  currentEnemy,
  currentEnemyIndex,
  inventory,
  hasRested,
  onEquipWeapon,
  onEquipArmor,
  onAttack,
  onEnemyAttack,
  onAwardXp,
  onRest,
  onRecordWin,
  onRecordLoss,
  onNextEnemy,
  onResetDungeon,
  canGetBonusMaterial
}: BattleProps) {
  const [combatLog, setCombatLog] = useState<CombatLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isCombatOver, setIsCombatOver] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [playerAnimating, setPlayerAnimating] = useState(false);
  const [enemyAnimating, setEnemyAnimating] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: string; value: number; isPlayer: boolean; x: number; y: number }[]>([]);
  const [bonusMaterialClaimed, setBonusMaterialClaimed] = useState(false);

  const addLog = useCallback((message: string, type: CombatLog['type']) => {
    setCombatLog(prev => [...prev.slice(-20), { id: Date.now().toString(), message, type }]);
  }, []);

  const showDamageNumber = useCallback((value: number, isPlayer: boolean) => {
    const id = Date.now().toString() + Math.random();
    const x = isPlayer ? 25 : 75;
    const y = 40 + Math.random() * 10;
    setDamageNumbers(prev => [...prev, { id, value, isPlayer, x, y }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 1000);
  }, []);

  const handleAttack = useCallback(() => {
    if (!currentEnemy || !isPlayerTurn || isCombatOver || currentEnemy.defeated) return;

    setPlayerAnimating(true);
    
    // Player attacks
    const result = onAttack(currentEnemy.id);
    
    setTimeout(() => {
      setPlayerAnimating(false);
      showDamageNumber(result.damage, false);
      addLog(`You dealt ${result.damage} damage!`, 'player');

      // Check if enemy defeated
      const updatedEnemy = { ...currentEnemy, currentHp: Math.max(0, currentEnemy.currentHp - result.damage) };
      
      if (updatedEnemy.currentHp <= 0) {
        addLog(`${currentEnemy.name} defeated! +${currentEnemy.xpReward} XP`, 'reward');
        onAwardXp(currentEnemy.xpReward);
        
        // Check if dungeon cleared
        if (currentEnemyIndex >= 2) {
          addLog('🏆 DUNGEON CLEARED! 🏆', 'reward');
          onRecordWin();
          setIsCombatOver(true);
        } else {
          setTimeout(() => {
            onNextEnemy();
            setIsPlayerTurn(true);
          }, 1000);
        }
      } else {
        // Enemy turn
        setIsPlayerTurn(false);
        setTimeout(() => {
          setEnemyAnimating(true);
          
          setTimeout(() => {
            const enemyResult = onEnemyAttack(currentEnemy);
            setEnemyAnimating(false);
            showDamageNumber(enemyResult.damage, true);
            addLog(`${currentEnemy.name} dealt ${enemyResult.damage} damage!`, 'enemy');

            if (enemyResult.playerDefeated) {
              addLog('You have been defeated...', 'system');
              onRecordLoss();
              setIsCombatOver(true);
            } else {
              setIsPlayerTurn(true);
            }
          }, 500);
        }, 800);
      }
    }, 300);
  }, [currentEnemy, isPlayerTurn, isCombatOver, onAttack, onEnemyAttack, onAwardXp, onNextEnemy, onRecordWin, onRecordLoss, addLog, showDamageNumber, currentEnemyIndex]);

  const handleHeal = useCallback(() => {
    if (!isPlayerTurn || isCombatOver || !currentEnemy) return;
    
    // Try to rest - will fail if already rested
    const restResult = onRest();
    if (!restResult.success) {
      addLog(restResult.message, 'system');
      return;
    }
    
    addLog(restResult.message, 'system');
    addLog('You are fully healed!', 'system');
    
    // Enemy gets a free attack after rest
    setIsPlayerTurn(false);
    setTimeout(() => {
      setEnemyAnimating(true);
      
      setTimeout(() => {
        const enemyResult = onEnemyAttack(currentEnemy);
        setEnemyAnimating(false);
        showDamageNumber(enemyResult.damage, true);
        addLog(`${currentEnemy.name} strikes while you rest! ${enemyResult.damage} damage!`, 'enemy');
        
        if (enemyResult.playerDefeated) {
          addLog('You have been defeated...', 'system');
          onRecordLoss();
          setIsCombatOver(true);
        } else {
          setIsPlayerTurn(true);
        }
      }, 500);
    }, 800);
  }, [isPlayerTurn, isCombatOver, currentEnemy, onRest, onEnemyAttack, onRecordLoss, addLog, showDamageNumber]);

  const handleReset = useCallback(() => {
    onResetDungeon();
    setCombatLog([]);
    setIsPlayerTurn(true);
    setIsCombatOver(false);
    setBonusMaterialClaimed(false);
  }, [onResetDungeon]);

  const claimBonusMaterial = useCallback(() => {
    setBonusMaterialClaimed(true);
    addLog('Bonus material claimed! Use it in the Forge.', 'reward');
  }, [addLog]);

  // Filter weapons and armor from inventory
  const weapons = inventory.filter(item => item.type === 'sword' || item.type === 'axe');
  const armors = inventory.filter(item => 
    item.type === 'armor' || 
    item.type === 'helmet' || 
    item.type === 'boots' || 
    item.type === 'gauntlets' || 
    item.type === 'shield'
  );

  const xpForNextLevel = getXpForNextLevel(player.level);
  const xpProgress = (player.xp / xpForNextLevel) * 100;

  return (
    <div className="battle-container">
      <div className="battle-header">
        <h2 className="section-title">
          <span>⚔️</span> Battle Arena
        </h2>
        <button 
          className="equipment-toggle"
          onClick={() => setShowEquipment(!showEquipment)}
        >
          {showEquipment ? 'Hide Equipment' : 'Manage Equipment'}
        </button>
      </div>

      {showEquipment && (
        <div className="equipment-panel">
          <div className="equipment-section">
            <h4>⚔️ Weapon</h4>
            <div className="equipment-grid">
              {player.equippedWeapon ? (
                <div 
                  className="equipped-item"
                  style={{ borderColor: RARITY_COLORS[player.equippedWeapon.rarity] }}
                  onClick={() => onEquipWeapon(null)}
                >
                  <span className="equipped-icon">{player.equippedWeapon.icon}</span>
                  <span className="equipped-name">{player.equippedWeapon.name}</span>
                  <span className="equipped-stat">⚔️ {player.equippedWeapon.stats.damage || 0}</span>
                  <button className="unequip-btn">✕</button>
                </div>
              ) : (
                <div className="empty-slot">No weapon equipped</div>
              )}
              
              {weapons.filter(w => w.id !== player.equippedWeapon?.id).map(weapon => (
                <div 
                  key={weapon.id}
                  className="equip-option"
                  style={{ borderColor: RARITY_COLORS[weapon.rarity] }}
                  onClick={() => onEquipWeapon(weapon)}
                >
                  <span>{weapon.icon}</span>
                  <span>{weapon.name}</span>
                  <span>⚔️ {weapon.stats.damage || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="equipment-section">
            <h4>🛡️ Armor</h4>
            <div className="equipment-grid">
              {player.equippedArmor ? (
                <div 
                  className="equipped-item"
                  style={{ borderColor: RARITY_COLORS[player.equippedArmor.rarity] }}
                  onClick={() => onEquipArmor(null)}
                >
                  <span className="equipped-icon">{player.equippedArmor.icon}</span>
                  <span className="equipped-name">{player.equippedArmor.name}</span>
                  <span className="equipped-stat">🛡️ {player.equippedArmor.stats.defense || 0}</span>
                  <button className="unequip-btn">✕</button>
                </div>
              ) : (
                <div className="empty-slot">No armor equipped</div>
              )}
              
              {armors.filter(a => a.id !== player.equippedArmor?.id).map(armor => (
                <div 
                  key={armor.id}
                  className="equip-option"
                  style={{ borderColor: RARITY_COLORS[armor.rarity] }}
                  onClick={() => onEquipArmor(armor)}
                >
                  <span>{armor.icon}</span>
                  <span>{armor.name}</span>
                  <span>🛡️ {armor.stats.defense || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="combat-arena">
        {/* Player Side */}
        <div className={`combatant player-side ${playerAnimating ? 'attacking' : ''}`}>
          <div className="combatant-info">
            <div className="combatant-header">
              <span className="combatant-icon">🧙</span>
              <div className="combatant-name">
                <span>Blacksmith</span>
                <span className="level-badge">Lvl {player.level}</span>
              </div>
            </div>
            
            <div className="hp-bar-container">
              <div className="hp-bar">
                <div 
                  className="hp-fill player-hp"
                  style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
                />
              </div>
              <span className="hp-text">{player.currentHp}/{player.maxHp} HP</span>
            </div>

            <div className="xp-bar-container">
              <div className="xp-bar">
                <div 
                  className="xp-fill"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="xp-text">{player.xp}/{xpForNextLevel} XP</span>
            </div>

            <div className="player-stats">
              <span>⚔️ {player.equippedWeapon?.stats.damage || 0}</span>
              <span>🛡️ {player.equippedArmor?.stats.defense || 0}</span>
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="vs-indicator">VS</div>

        {/* Enemy Side */}
        <div className={`combatant enemy-side ${enemyAnimating ? 'attacking' : ''}`}>
          {currentEnemy ? (
            <div className="combatant-info">
              <div className="combatant-header">
                <span className="combatant-icon">{currentEnemy.icon}</span>
                <div className="combatant-name">
                  <span>{currentEnemy.name}</span>
                  <span className="enemy-number">{currentEnemyIndex + 1}/3</span>
                </div>
              </div>
              
              <div className="hp-bar-container">
                <div className="hp-bar">
                  <div 
                    className="hp-fill enemy-hp"
                    style={{ width: `${(currentEnemy.currentHp / currentEnemy.maxHp) * 100}%` }}
                  />
                </div>
                <span className="hp-text">{currentEnemy.currentHp}/{currentEnemy.maxHp} HP</span>
              </div>

              <div className="enemy-reward">
                <span>🎁 +{currentEnemy.xpReward} XP</span>
              </div>
            </div>
          ) : (
            <div className="dungeon-complete">
              <span className="complete-icon">🏆</span>
              <p>Dungeon Cleared!</p>
            </div>
          )}
        </div>
      </div>

      {/* Damage Numbers */}
      {damageNumbers.map(d => (
        <div 
          key={d.id}
          className={`damage-number ${d.isPlayer ? 'player-damage' : 'enemy-damage'}`}
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
        >
          {d.value}
        </div>
      ))}

      {/* Combat Controls */}
      <div className="combat-controls">
        {!isCombatOver && currentEnemy ? (
          <>
            <button
              className={`attack-btn ${!isPlayerTurn ? 'disabled' : ''}`}
              onClick={handleAttack}
              disabled={!isPlayerTurn}
            >
              ⚔️ Attack
            </button>
            <button
              className={`heal-btn ${!isPlayerTurn || hasRested ? 'disabled' : ''}`}
              onClick={handleHeal}
              disabled={!isPlayerTurn || hasRested}
            >
              {hasRested ? '💤 RESTED (Used)' : '🏥 Rest (Full Heal)'}
            </button>
          </>
        ) : isCombatOver ? (
          <div className="combat-over">
            {player.currentHp > 0 && (
              <>
                <h3>Victory! 🎉</h3>
                {canGetBonusMaterial && !bonusMaterialClaimed && (
                  <button className="bonus-btn" onClick={claimBonusMaterial}>
                    🎁 Claim Bonus Material
                  </button>
                )}
              </>
            )}
            <button className="reset-btn" onClick={handleReset}>
              🔄 Enter Dungeon Again
            </button>
          </div>
        ) : null}
      </div>

      {/* Combat Log */}
      <div className="combat-log">
        <h4>📜 Combat Log</h4>
        <div className="log-entries">
          {combatLog.length === 0 ? (
            <p className="empty-log">Battle begins! Click Attack to fight.</p>
          ) : (
            combatLog.map(entry => (
              <div key={entry.id} className={`log-entry ${entry.type}`}>
                {entry.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Win/Loss Stats */}
      <div className="battle-stats">
        <span>🏆 {player.wins} Wins</span>
        <span>💀 {player.losses} Losses</span>
      </div>
    </div>
  );
}
