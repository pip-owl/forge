import { Material } from '../types';

interface MaterialGridProps {
  materials: Material[];
  selectedMaterials: Material[];
  onSelect: (material: Material) => void;
  disabled: boolean;
}

export function MaterialGrid({ materials, selectedMaterials, onSelect, disabled }: MaterialGridProps) {
  const isSelected = (material: Material) => 
    selectedMaterials.some(m => m.id === material.id);
  
  const isFull = selectedMaterials.length >= 3;

  return (
    <div className="material-grid">
      <h3 className="section-title">⚗️ Available Materials</h3>
      <div className="grid">
        {materials.map(material => (
          <button
            key={material.id}
            className={`material-card ${isSelected(material) ? 'selected' : ''} ${isFull && !isSelected(material) ? 'disabled' : ''}`}
            onClick={() => onSelect(material)}
            disabled={disabled || (isFull && !isSelected(material))}
            style={{ '--material-color': material.color } as React.CSSProperties}
          >
            <span className="material-icon">{material.icon}</span>
            <span className="material-name">{material.name}</span>
            <span className="material-type">{material.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
