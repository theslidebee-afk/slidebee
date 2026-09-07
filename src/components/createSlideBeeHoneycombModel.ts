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

function createBacklitTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.25, '#FFF6BD');
  grad.addColorStop(0.60, '#FCBF14');
  grad.addColorStop(0.85, '#D99F06');
  grad.addColorStop(1, '#7A5208');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const x = 256 + Math.cos(ang) * 205;
    const y = 256 + Math.sin(ang) * 205;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates high-resolution procedural canvas textures for the honeycomb display faces
 */
function createDisplayTexture(type: 'display_chart' | 'display_kpi' | 'display_logo' | 'display_slides'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background - rich obsidian gradient with subtle inner vignette
  const bgGrad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  bgGrad.addColorStop(0, '#1c1b18');
  bgGrad.addColorStop(1, '#0e0e0f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle hexagonal guidelines
  ctx.strokeStyle = 'rgba(252, 191, 20, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const x = 256 + Math.cos(ang) * 230;
    const y = 256 + Math.sin(ang) * 230;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  if (type === 'display_chart') {
    ctx.fillStyle = '#FCBF14';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GROWTH METRICS', 256, 140);

    ctx.fillStyle = 'rgba(255, 249, 232, 0.75)';
    ctx.font = '500 16px sans-serif';
    ctx.fillText('Q3 Performance', 256, 168);

    const bars = [40, 65, 85, 115, 145, 185];
    const barWidth = 32;
    const gap = 14;
    const totalWidth = bars.length * barWidth + (bars.length - 1) * gap;
    const startX = 256 - totalWidth / 2;
    const baseY = 330;
    const points: [number, number][] = [];

    bars.forEach((h, i) => {
      const x = startX + i * (barWidth + gap);
      const y = baseY - h;
      points.push([x + barWidth / 2, y]);

      const barGrad = ctx.createLinearGradient(x, y, x, baseY);
      barGrad.addColorStop(0, '#FFE885');
      barGrad.addColorStop(0.4, '#FCBF14');
      barGrad.addColorStop(1, '#936610');
      ctx.fillStyle = barGrad;
      ctx.fillRect(x, y, barWidth, h);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y - 2, barWidth, 3);
    });

    ctx.strokeStyle = '#FFEAA7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    points.forEach(([px, py]) => {
      ctx.fillStyle = '#FCBF14';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#FCBF14';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+185% KPI', 256, 385);
  } else if (type === 'display_kpi') {
    // Circular KPI Gauge
    const cx = 256;
    const cy = 250;
    const radius = 95;

    ctx.strokeStyle = 'rgba(252, 191, 20, 0.2)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    ctx.strokeStyle = '#FCBF14';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 1.95);
    ctx.stroke();

    ctx.fillStyle = '#FFF9E8';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('98%', cx, cy + 15);

    ctx.fillStyle = '#FCBF14';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('WIN RATE', cx, cy + 45);

    ctx.fillStyle = 'rgba(255, 249, 232, 0.7)';
    ctx.font = '500 18px sans-serif';
    ctx.fillText('45+ Pitch Decks Funded', cx, 395);
  } else if (type === 'display_logo') {
    // SlideBee Studio Emblem
    const cx = 256;
    const cy = 230;

    ctx.fillStyle = 'rgba(252, 191, 20, 0.15)';
    ctx.strokeStyle = '#FCBF14';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const x = cx + Math.cos(ang) * 70;
      const y = cy + Math.sin(ang) * 70;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FCBF14';
    ctx.font = '900 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SB', cx, cy + 15);

    ctx.fillStyle = '#FFF9E8';
    ctx.font = '800 26px sans-serif';
    ctx.fillText('SLIDEBEE', cx, cy + 115);

    ctx.fillStyle = '#FCBF14';
    ctx.font = '600 14px sans-serif';
    ctx.fillText('DESIGN STUDIO', cx, cy + 140);
  } else if (type === 'display_slides') {
    ctx.fillStyle = 'rgba(252, 191, 20, 0.9)';
    ctx.font = '800 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SERIES A PITCH', 110, 150);

    const cardY = 175;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = '#FCBF14';
    ctx.lineWidth = 2;
    ctx.fillRect(110, cardY, 292, 160);
    ctx.strokeRect(110, cardY, 292, 160);

    ctx.fillStyle = '#FCBF14';
    ctx.fillRect(130, cardY + 25, 80, 12);
    ctx.fillStyle = 'rgba(255, 249, 232, 0.8)';
    ctx.fillRect(130, cardY + 48, 160, 8);
    ctx.fillRect(130, cardY + 64, 130, 8);

    ctx.beginPath();
    ctx.arc(340, cardY + 55, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#936610';
    ctx.fill();
    ctx.strokeStyle = '#FFE082';
    ctx.stroke();

    ctx.fillStyle = '#FCBF14';
    ctx.font = '700 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$4.5M', 340, cardY + 61);

    ctx.fillStyle = 'rgba(255, 249, 232, 0.6)';
    ctx.font = '500 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Seed Round Closed in 14 Days', 110, 375);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Creates flat-topped hexagonal Shape
 */
function createHexagonShape(radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    // Flat-topped angles: 0, 60, 120, 180, 240, 300 deg
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/**
 * Procedural SlideBEE 3D Honeycomb Structure Factory
 * Reconstructed using img2threejs procedural geometry principles
 */
export function createSlideBeeHoneycombModel(options: ProceduralModelOptions = {}): ProceduralModelRuntime {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'SlideBee_Honeycomb_Root';

  const cellRadius = 1.35; // outer radius
  const cellDepth = 0.85;  // extrusion depth
  const bevelThickness = 0.08;
  const bevelSize = 0.08;

  // 1. Master Geometries
  // Outer Housing Hexagon
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
  // Deep Obsidian Metallic Frame
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#141416'),
    metalness: 0.85,
    roughness: 0.28,
    envMapIntensity: 1.2,
    wireframe: !!options.wireframe
  });

  // Gleaming Honey Yellow Metallic Rim
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

  // Backlit Warm Gold Diffuser Material (Glowing Honeycomb Cells)
  const backlitGoldMat = new THREE.MeshBasicMaterial({
    map: backlitTexture,
    side: THREE.DoubleSide
  });

  // Deep recessed chamber back material
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

  interface CellConfig {
    id: string;
    col: number;
    row: number;
    zOffset?: number;
    type: 'display_chart' | 'display_kpi' | 'display_logo' | 'backlit_gold' | 'deep_obsidian' | 'display_slides';
  }

  // Exact artistic arrangement inspired by the generated reference image
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

  const cellsRuntime: HoneycombCellRuntime[] = [];

  cellConfigs.forEach((config, idx) => {
    const cellGroup = new THREE.Group();
    cellGroup.name = config.id;

    // Calculate axial spatial position
    const posX = config.col * dx;
    const posY = config.row * dy;
    const posZ = config.zOffset || 0;

    cellGroup.position.set(posX, posY, posZ);

    // Outer Obsidian Body Mesh
    const baseMesh = new THREE.Mesh(outerGeo, obsidianMat.clone());
    baseMesh.castShadow = options.castShadow !== false;
    baseMesh.receiveShadow = options.receiveShadow !== false;
    cellGroup.add(baseMesh);

    // Golden Front Beveled Rim (sits on front face)
    const rimMatInstance = goldRimMat.clone();
    const rimMesh = new THREE.Mesh(rimGeo, rimMatInstance);
    rimMesh.position.z = 0.51;
    cellGroup.add(rimMesh);

    // Face Plate (Content / Glow / Cavity)
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
    // Position face plate right inside the rim
    faceMesh.position.z = config.type === 'deep_obsidian' ? 0.15 : 0.505;
    cellGroup.add(faceMesh);

    // Add point light inside backlit honey cells
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

  // Placed right in the Hero showcase area
  rootGroup.position.set(4.8, 0.2, 0.0);

  // 4. Floating Ambient Golden Pollen Motes
  const particleCount = 180;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 16;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 + 1.5;
    particleScales[i] = Math.random() * 0.8 + 0.3;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

  const pCanvas = document.createElement('canvas');
  pCanvas.width = 64;
  pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d');
  if (pCtx) {
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 240, 160, 1)');
    pGrad.addColorStop(0.35, 'rgba(252, 191, 20, 0.85)');
    pGrad.addColorStop(0.8, 'rgba(252, 191, 20, 0.25)');
    pGrad.addColorStop(1, 'rgba(252, 191, 20, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
  }
  const pollenTexture = new THREE.CanvasTexture(pCanvas);

  const particleMat = new THREE.PointsMaterial({
    size: 0.22,
    map: pollenTexture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  rootGroup.add(particleSystem);

  // 5. Interactive Animation Runtime Loop
  const setHoveredCell = (index: number | null) => {
    cellsRuntime.forEach((cell) => {
      cell.isHovered = (cell.index === index);
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
