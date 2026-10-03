import * as THREE from 'three';
import type { ProceduralModelOptions, ProceduralModelRuntime, HoneycombCellRuntime } from './types';
import {
  createBacklitTexture,
  createDisplayTexture
} from './canvasTextures';
import {
  createHexagonShape,
  createParticleSystem
} from './geometry';

interface CellConfig {
  id: string;
  col: number;
  row: number;
  zOffset?: number;
  type: 'display_chart' | 'display_kpi' | 'display_logo' | 'backlit_gold' | 'deep_obsidian' | 'display_slides';
}

const cellConfigs: CellConfig[] = [
  // Center & Prominent Tier
  { id: 'cell_chart', col: 1, row: 0, zOffset: 0.25, type: 'display_chart' },
  { id: 'cell_kpi', col: 2, row: -0.5, zOffset: 0.35, type: 'display_kpi' },
  { id: 'cell_logo', col: -0.5, row: -0.5, zOffset: 0.20, type: 'display_logo' },
  { id: 'cell_slides', col: 0, row: -1.0, zOffset: 0.15, type: 'display_slides' },

  // Backlit Warm Glowing Honey Cells
  { id: 'cell_glow_top', col: 0, row: 1.0, zOffset: 0.10, type: 'backlit_gold' },
  { id: 'cell_glow_left', col: -1.5, row: 0.5, zOffset: 0.05, type: 'backlit_gold' },
  { id: 'cell_glow_mid_low', col: 1, row: -1.0, zOffset: 0.12, type: 'backlit_gold' },
  { id: 'cell_glow_far_right_top', col: 2.5, row: 0.5, zOffset: 0.08, type: 'backlit_gold' },
  { id: 'cell_glow_far_right_mid', col: 2.5, row: -0.5, zOffset: 0.14, type: 'backlit_gold' },
  { id: 'cell_glow_bottom', col: 0.5, row: -2.0, zOffset: 0.05, type: 'backlit_gold' },

  // Deep Cavities & Structural Obsidian Anchors
  { id: 'cell_obsidian_top_right', col: 1.5, row: 1.5, zOffset: -0.05, type: 'deep_obsidian' },
  { id: 'cell_obsidian_mid_void', col: 0, row: 0, zOffset: -0.15, type: 'deep_obsidian' },
  { id: 'cell_obsidian_far_left_low', col: -1.5, row: -0.5, zOffset: 0.0, type: 'deep_obsidian' },
  { id: 'cell_obsidian_far_right_low', col: 2, row: -1.5, zOffset: -0.05, type: 'deep_obsidian' },
  { id: 'cell_obsidian_wing', col: 3.5, row: 0.0, zOffset: -0.10, type: 'deep_obsidian' }
];

export function createSlideBeeHoneycombModel(options: ProceduralModelOptions = {}): ProceduralModelRuntime {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'SlideBee_Honeycomb_Root';

  const cellRadius = 1.35;
  const cellDepth = 0.85;
  const bevelThickness = 0.08;
  const bevelSize = 0.08;

  // 1. Master Geometries
  const outerShape = createHexagonShape(cellRadius);
  const outerExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: cellDepth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: bevelSize,
    bevelThickness: bevelThickness
  };
  const outerGeo = new THREE.ExtrudeGeometry(outerShape, outerExtrudeSettings);
  outerGeo.center();

  // Golden Beveled Front Rim (Inner frame)
  const rimShape = createHexagonShape(cellRadius * 0.94);
  const rimHole = createHexagonShape(cellRadius * 0.80);
  rimShape.holes.push(rimHole);
  const rimExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03
  };
  const rimGeo = new THREE.ExtrudeGeometry(rimShape, rimExtrudeSettings);
  rimGeo.center();

  // Face Plate Hexagon (for displays & backlit diffusers)
  const faceShape = createHexagonShape(cellRadius * 0.82);
  const faceGeo = new THREE.ShapeGeometry(faceShape);

  // 2. Shared Materials
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#141416'),
    metalness: 0.85,
    roughness: 0.28,
    envMapIntensity: 1.2,
    wireframe: !!options.wireframe
  });

  const goldRimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FCBF14'),
    metalness: 0.92,
    roughness: 0.16,
    emissive: new THREE.Color('#936610'),
    emissiveIntensity: 0.28,
    envMapIntensity: 2.0,
    wireframe: !!options.wireframe
  });

  // Reusable Display & Backlit Textures
  const backlitTexture = createBacklitTexture();
  const chartTexture = createDisplayTexture('display_chart');
  const kpiTexture = createDisplayTexture('display_kpi');
  const logoTexture = createDisplayTexture('display_logo');
  const slidesTexture = createDisplayTexture('display_slides');

  const backlitGoldMat = new THREE.MeshBasicMaterial({ map: backlitTexture, side: THREE.DoubleSide });
  const cavityBackMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0A0A0C'),
    metalness: 0.6,
    roughness: 0.6,
    wireframe: !!options.wireframe
  });

  const chartMat = new THREE.MeshBasicMaterial({ map: chartTexture, side: THREE.DoubleSide });
  const kpiMat = new THREE.MeshBasicMaterial({ map: kpiTexture, side: THREE.DoubleSide });
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTexture, side: THREE.DoubleSide });
  const slidesMat = new THREE.MeshBasicMaterial({ map: slidesTexture, side: THREE.DoubleSide });

  // 3. Honeycomb Layout Definitions
  const dx = cellRadius * 1.55;
  const dy = cellRadius * Math.sqrt(3) * 1.02;

  const cellsRuntime: HoneycombCellRuntime[] = [];

  cellConfigs.forEach((config, idx) => {
    const cellGroup = new THREE.Group();
    cellGroup.name = config.id;

    const posX = config.col * dx;
    const posY = config.row * dy;
    const posZ = config.zOffset || 0;

    cellGroup.position.set(posX, posY, posZ);

    const baseMesh = new THREE.Mesh(outerGeo, obsidianMat.clone());
    baseMesh.castShadow = options.castShadow !== false;
    baseMesh.receiveShadow = options.receiveShadow !== false;
    cellGroup.add(baseMesh);

    const rimMatInstance = goldRimMat.clone();
    const rimMesh = new THREE.Mesh(rimGeo, rimMatInstance);
    rimMesh.position.z = 0.51;
    cellGroup.add(rimMesh);

    let faceMat: THREE.Material;
    switch (config.type) {
      case 'display_chart':
        faceMat = chartMat;
        break;
      case 'display_kpi':
        faceMat = kpiMat;
        break;
      case 'display_logo':
        faceMat = logoMat;
        break;
      case 'display_slides':
        faceMat = slidesMat;
        break;
      case 'backlit_gold':
        faceMat = backlitGoldMat.clone();
        break;
      default:
        faceMat = cavityBackMat;
        break;
    }

    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.z = config.type === 'deep_obsidian' ? 0.15 : 0.505;
    cellGroup.add(faceMesh);

    if (config.type === 'backlit_gold') {
      const innerLight = new THREE.PointLight(0xfcbf14, 2.5, 4.0);
      innerLight.position.set(0, 0, 0.6);
      cellGroup.add(innerLight);
    }

    cellGroup.userData = {
      cellIndex: idx,
      cellId: config.id,
      isInteractiveCell: true
    };

    rootGroup.add(cellGroup);

    cellsRuntime.push({
      id: config.id,
      index: idx,
      group: cellGroup,
      baseMesh,
      rimMesh,
      faceMesh,
      rimMaterial: rimMatInstance,
      baseMaterial: baseMesh.material as THREE.MeshStandardMaterial,
      faceMaterial: faceMat,
      initialPos: new THREE.Vector3(posX, posY, posZ),
      targetPos: new THREE.Vector3(posX, posY, posZ),
      initialRot: cellGroup.rotation.clone(),
      type: config.type,
      isHovered: false
    });
  });

  rootGroup.position.set(4.8, 0.2, 0.0);

  // 4. Ambient particles
  const { particleSystem, particleGeo, pollenTexture, particleCount } = createParticleSystem(180);
  rootGroup.add(particleSystem);

  // 5. Interactive Animation Runtime Loop
  const setHoveredCell = (index: number | null) => {
    cellsRuntime.forEach((cell) => {
      cell.isHovered = cell.index === index;
    });
  };

  const update = (_delta: number, elapsedTime: number) => {
    const clusterBob = Math.sin(elapsedTime * 0.8) * 0.12;
    rootGroup.position.y = 0.2 + clusterBob;

    const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      array[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.0025;
      array[i * 3] += Math.cos(elapsedTime * 0.5 + i) * 0.0018;
    }
    posAttr.needsUpdate = true;
    particleSystem.rotation.z = elapsedTime * 0.02;

    cellsRuntime.forEach((cell) => {
      const { initialPos, targetPos, group, rimMaterial, isHovered } = cell;
      const idleZ = Math.sin(elapsedTime * 1.2 + cell.index * 0.7) * 0.05;

      if (isHovered) {
        targetPos.z = initialPos.z + 0.45;
        rimMaterial.emissiveIntensity = THREE.MathUtils.lerp(rimMaterial.emissiveIntensity, 0.95, 0.15);
        rimMaterial.color.setRGB(1.0, 0.82, 0.2);
      } else {
        targetPos.z = initialPos.z + idleZ;
        rimMaterial.emissiveIntensity = THREE.MathUtils.lerp(rimMaterial.emissiveIntensity, 0.28, 0.08);
        rimMaterial.color.setRGB(0.99, 0.75, 0.08);
      }

      group.position.z += (targetPos.z - group.position.z) * 0.12;
      group.position.x += (targetPos.x - group.position.x) * 0.12;
      group.position.y += (targetPos.y - group.position.y) * 0.12;

      const targetRotX = isHovered ? -0.06 : 0;
      const targetRotY = isHovered ? 0.08 : 0;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.12;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.12;
    });
  };

  const dispose = () => {
    outerGeo.dispose();
    rimGeo.dispose();
    faceGeo.dispose();
    particleGeo.dispose();
    obsidianMat.dispose();
    goldRimMat.dispose();
    backlitGoldMat.dispose();
    cavityBackMat.dispose();
    backlitTexture.dispose();
    chartTexture.dispose();
    kpiTexture.dispose();
    logoTexture.dispose();
    slidesTexture.dispose();
    pollenTexture.dispose();
  };

  return {
    rootGroup,
    cells: cellsRuntime,
    particleSystem,
    update,
    setHoveredCell,
    dispose
  };
}
