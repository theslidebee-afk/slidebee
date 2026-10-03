import * as THREE from 'three';
import { createPollenTexture } from './canvasTextures';

/**
 * Creates flat-topped hexagonal Shape
 */
export function createHexagonShape(radius: number): THREE.Shape {
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
 * Floating Ambient Golden Pollen Motes
 */
export function createParticleSystem(count = 180): {
  particleSystem: THREE.Points;
  particleGeo: THREE.BufferGeometry;
  pollenTexture: THREE.CanvasTexture;
  particleMat: THREE.PointsMaterial;
  particleCount: number;
} {
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(count * 3);
  const particleScales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 16;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 + 1.5;
    particleScales[i] = Math.random() * 0.8 + 0.3;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

  const pollenTexture = createPollenTexture();

  const particleMat = new THREE.PointsMaterial({
    size: 0.22,
    map: pollenTexture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  return {
    particleSystem,
    particleGeo,
    pollenTexture,
    particleMat,
    particleCount: count
  };
}
