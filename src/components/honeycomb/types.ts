import * as THREE from 'three';

export interface ProceduralModelOptions {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  qualityPriority?: 'reference-fidelity' | 'balanced';
}

export interface HoneycombCellRuntime {
  id: string;
  index: number;
  group: THREE.Group;
  baseMesh: THREE.Mesh;
  rimMesh: THREE.Mesh;
  faceMesh: THREE.Mesh;
  rimMaterial: THREE.MeshStandardMaterial;
  baseMaterial: THREE.MeshStandardMaterial;
  faceMaterial: THREE.Material;
  initialPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  initialRot: THREE.Euler;
  type: 'display_chart' | 'display_kpi' | 'display_logo' | 'backlit_gold' | 'deep_obsidian' | 'display_slides';
  isHovered: boolean;
}

export interface ProceduralModelRuntime {
  rootGroup: THREE.Group;
  cells: HoneycombCellRuntime[];
  particleSystem: THREE.Points;
  update: (delta: number, elapsedTime: number) => void;
  setHoveredCell: (index: number | null) => void;
  dispose: () => void;
}
